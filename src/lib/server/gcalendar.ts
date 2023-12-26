import { GoogleApis, calendar_v3, google } from 'googleapis';
import fs from 'fs/promises';
import path from 'path';
import type { GaxiosPromise, JWT } from 'googleapis-common';
import db from './database';
import type { EquipmentId, ReservationId, UserId } from '$lib/types';
import { error } from '@sveltejs/kit';
import { groupBy, mapValues } from 'lodash-es';
import { GOOGLE_CALENDAR_SERVICE_ACCOUNT } from '$env/static/private';

// https://developers.google.com/calendar/api/quickstart/nodejs
const SCOPES = [
	'https://www.googleapis.com/auth/calendar',
	'https://www.googleapis.com/auth/calendar.events'
];

async function authorize() {
	const jwtClient = new google.auth.JWT({
		key: JSON.parse(GOOGLE_CALENDAR_SERVICE_ACCOUNT).private_key,
		email: JSON.parse(GOOGLE_CALENDAR_SERVICE_ACCOUNT).client_email,
		keyId: JSON.parse(GOOGLE_CALENDAR_SERVICE_ACCOUNT).private_key_id,
		scopes: SCOPES
	});
	await jwtClient.authorize();
	return jwtClient;
}

export async function shareCalendar(calendarId: string, user_email: string, readonly = true) {
	const calendar = google.calendar('v3');
	const auth = await authorize();
	const res = await new Promise((resolve) => {
		calendar.acl.insert(
			{
				auth,
				calendarId,
				resource: {
					role: readonly ? 'reader' : 'writer',
					scope: {
						type: 'user',
						value: user_email
					}
				}
			},
			function (err: any, response: any) {
				console.log(response.data);
				resolve(response.data);
			}
		);
	});
	return res;
}

async function createCalendarForUser(
	calendar: calendar_v3.Calendar,
	auth: JWT,
	user: { id: string; email: string; name: string },
	equipment_ids: string[]
) {
	const r = calendar.calendars.insert({
		auth: auth,
		requestBody: { summary: `共通機器 - ${user.name}` }
	});
	r.then((res) => {
		const calendarId = res.data.id;
		if (!calendarId) {
			throw new Error('Fail to create a calendar');
		}
		db.none('INSERT INTO "gcalendar_for_user" (user, gcalendar_id) VALUES ($1, $2)', [
			user.id,
			calendarId
		]);
		for (const eq_id of equipment_ids) {
			db.none(
				"INSERT INTO 'equipment_in_gcalendar_for_user' (gcalendar_id, equipment) VALUES ($1, $2)",
				[calendarId, eq_id]
			);
		}
	});
}

async function addEventToCalendar(
	calendarId: string,
	reservation_id: ReservationId,
	data: {
		user_id: UserId;
		user_name: string;
		start_time: Date;
		end_time: Date;
		reserve_comment: string;
	}
) {
	const mkEvent = (summary: string, description: string) => {
		return {
			summary,
			description,
			start: {
				dateTime: data.start_time.toISOString(),
				timeZone: 'Asia/Tokyo'
			},
			end: {
				dateTime: data.end_time.toISOString(),
				timeZone: 'Asia/Tokyo'
			},
			attendees: [],
			reminders: {
				useDefault: false,
				overrides: [
					{ method: 'email', minutes: 24 * 60 },
					{ method: 'popup', minutes: 10 }
				]
			}
		};
	};
	const calendar = google.calendar('v3');
	const auth = await authorize();
	const gcalendar_events: { [gcalendar_id: string]: string } = {};
	const eid = await new Promise<string>((resolve) => {
		calendar.events.insert(
			{
				auth: auth,
				calendarId,
				resource: mkEvent(`${data.user_name}`, `${data.reserve_comment}`)
			},
			function (err: any, res: any) {
				if (err) {
					console.log('There was an error contacting the Calendar service: ' + err);
					return;
				}
				// console.log('Event created', res);
				resolve(res.data.id);
			}
		);
	});
	gcalendar_events[calendarId] = eid;
	await db.query(
		'INSERT INTO gcalendar_event_for_reservation(gcalendar_event_id,gcalendar_id,reservation) VALUES ($1,$2,$3)',
		[eid, calendarId, reservation_id]
	);

	return;
}

export async function createCalendarForEquipment(
	equipment_id: string
): Promise<{ id: string; created: boolean }> {
	const calendar = google.calendar('v3');
	const auth = await authorize();
	const c = await db.oneOrNone('SELECT * FROM "gcalendar_for_equipment" WHERE equipment = $1', [
		equipment_id
	]);
	if (c) {
		// すでに存在する
		return { id: c.gcalendar_id, created: false };
	}
	const eq = await db.oneOrNone('SELECT * FROM "equipment" WHERE id = $1', [equipment_id]);
	const r = calendar.calendars.insert({
		auth: auth,
		requestBody: { summary: `${eq.name}` }
	});
	const r2 = await new Promise<{ id: string; created: boolean }>((resolve) => {
		r.then(async (res) => {
			const calendarId = res.data.id;
			if (!calendarId) {
				throw new Error('Fail to create a calendar');
			}
			db.none('INSERT INTO "gcalendar_for_equipment" (equipment, gcalendar_id) VALUES ($1, $2)', [
				equipment_id,
				calendarId
			]);
			//すでにある予約を新しく作成したカレンダーに追加。
			const reservations = await db.manyOrNone(
				'SELECT r."comment",r.id,start_time,r."user", u.name as user_name, end_time FROM reservation r LEFT JOIN "user" u ON r."user"=u.id WHERE equipment = $1',
				[equipment_id]
			);
			for (const r of reservations) {
				await addEventToCalendar(calendarId, r.id, {
					user_id: r.user,
					user_name: r.user_name,
					reserve_comment: r.comment,
					start_time: r.start_time,
					end_time: r.end_time
				});
			}
			resolve({ id: calendarId, created: true });
		});
	});
	return r2;
}

export async function deleteCalendarForEquipment(
	equipment_id: string
): Promise<{ id: string | undefined; deleted: boolean }> {
	const calendar = google.calendar('v3');
	const auth = await authorize();
	const c = await db.oneOrNone('SELECT * FROM "gcalendar_for_equipment" WHERE equipment = $1', [
		equipment_id
	]);
	if (!c) {
		return { id: undefined, deleted: false };
	}
	const r = await new Promise<boolean>((resolve) => {
		calendar.calendars
			.delete({
				auth: auth,
				calendarId: c.gcalendar_id
			})
			.then((res) => {
				resolve(true);
			})
			.catch((err) => {
				console.log('Calendar API error', err?.response?.message);
				resolve(false);
			});
	});
	const r2 = await db.oneOrNone(
		'DELETE FROM gcalendar_for_equipment WHERE equipment = $1 RETURNING gcalendar_id',
		[equipment_id]
	);

	return r2?.gcalendar_id
		? { id: r2.gcalendar_id, deleted: true }
		: { id: undefined, deleted: false };
}

async function deleteCalendar(calendar: calendar_v3.Calendar, auth: JWT, calendarId: string) {
	calendar.calendars.delete({
		auth: auth,
		calendarId
	});
}

export async function deleteCalendarEvent(calendarId: string, eventId: string) {
	const calendar = google.calendar('v3');
	const auth = await authorize();
	const r = await new Promise<{ ok: boolean }>((resolve) => {
		calendar.events
			.delete({
				auth: auth,
				calendarId,
				eventId
			})
			.then((r: any) => {
				resolve({ ok: r.ok });
			})
			.catch((err) => {
				resolve({ ok: false });
			});
	});
	return r;
}

async function syncCalendarsOnDB(user_id: UserId, calendars: string[]) {
	const calendar = google.calendar('v3');
	const auth = await authorize();
	const res = await calendar.calendarList.list({ auth: auth });
	const rs = await db.manyOrNone(
		'SELECT c.gcalendar_id,e.equipment FROM "gcalendar_for_user" c JOIN equipment_in_gcalendar_for_user e ON c.gcalendar_id=e.gcalendar_id WHERE user = $1',
		[user_id]
	);
	const calendarIds = rs.map((r) => r.gcalendar_id) as string[];
	const ids: string[] = [];
	for (const calendarId of calendarIds) {
		if (calendars.indexOf(calendarId) != -1) {
			ids.push(calendarId);
		} else {
			await deleteCalendar(calendar, auth, calendarId);
		}
	}
}

async function calendarsForUser(user_id: UserId): Promise<{ [gcalendar: string]: EquipmentId[] }> {
	const calendar = google.calendar('v3');
	const auth = await authorize();
	const res = await calendar.calendarList.list({ auth: auth });
	const calendars = res.data.items?.map((c) => c.id).filter((c) => c) as string[];
	const rs = await db.manyOrNone(
		'SELECT c.gcalendar_id,e.equipment FROM "gcalendar_for_user" c JOIN equipment_in_gcalendar_for_user e ON c.gcalendar_id=e.gcalendar_id WHERE user = $1',
		[user_id]
	);
	const parseRow = (d: any) => {
		return { gcalendar: d.gcalendar_id as string, equipment: d.equipment as EquipmentId };
	};
	// ToDo: check this code
	const rs2 = rs.map(parseRow);

	const rs3: { [gcalendar: string]: EquipmentId[] } = mapValues(groupBy(rs2, 'gcalendar'), (v) =>
		v.map((r) => r.equipment)
	);

	return rs3;
}

async function calendarForEquipment(equipment_id: EquipmentId): Promise<string | undefined> {
	const calendar = google.calendar('v3');
	const auth = await authorize();
	const res = await calendar.calendarList.list({ auth: auth });
	const r = await db.oneOrNone('SELECT * FROM "gcalendar_for_equipment" WHERE equipment = $1', [
		equipment_id
	]);
	const calendarId = r?.gcalendar_id;
	return calendarId;
}

export async function addReservationToCalendars(
	reservation: ReservationId,
	user: { id: UserId; email: string; name: string },
	data: {
		start_time: Date;
		end_time: Date;
		user: string;
		equipment: EquipmentId;
		reserve_comment: string;
	}
): Promise<{ [gcalendar_id: string]: string } | undefined> {
	//Make an event in the google Calendar
	const auth = await authorize();
	const calendar = google.calendar('v3');

	const calendarEq = await calendarForEquipment(data.equipment);
	const calendarsUser = Object.entries(await calendarsForUser(user.id))
		.filter(([_, es]) => es.indexOf(data.equipment) != -1)
		.map(([c, _]) => c);

	const eq_name = (await db.oneOrNone('SELECT name FROM equipment WHERE id = $1', [data.equipment]))
		?.name as string | undefined;

	const mkEvent = (summary: string, description: string) => {
		return {
			summary,
			description,
			start: {
				dateTime: data.start_time.toISOString(),
				timeZone: 'Asia/Tokyo'
			},
			end: {
				dateTime: data.end_time.toISOString(),
				timeZone: 'Asia/Tokyo'
			},
			attendees: [user.email],
			reminders: {
				useDefault: false,
				overrides: [
					{ method: 'email', minutes: 24 * 60 },
					{ method: 'popup', minutes: 10 }
				]
			}
		};
	};
	const gcalendar_events: { [gcalendar_id: string]: string } = {};
	if (calendarEq) {
		const eid = await new Promise<string>((resolve) => {
			calendar.events.insert(
				{
					auth: auth,
					calendarId: calendarEq,
					resource: mkEvent(`${user.name}`, `${data.reserve_comment}`)
				},
				function (err: any, res: any) {
					if (err) {
						console.log('There was an error contacting the Calendar service: ' + err);
						return;
					}
					// console.log('Event created', res);
					resolve(res.data.id);
				}
			);
		});
		gcalendar_events[calendarEq] = eid;
	}
	for (const calendarId of calendarsUser) {
		const eid = await new Promise<string>((resolve) => {
			calendar.events.insert(
				{
					auth: auth,
					calendarId,
					resource: mkEvent(`${user.name}: ${eq_name}`, `${data.reserve_comment}`)
				},
				function (err: any, res: any) {
					if (err) {
						console.log('There was an error contacting the Calendar service: ' + err);
						return;
					}
					// console.log('Event created', res);
					resolve(res.data.id);
				}
			);
		});
		gcalendar_events[calendarId] = eid;
	}
	return gcalendar_events;
	// calendar.events.watch(
	// 	{
	// 		auth,
	// 		calendarId:
	// 			'1d3f68de57019612d8505b08b1fa05f5cdab8f01072094407be6844bdef77784@group.calendar.google.com',
	// 		resource: {
	// 			id: 'test',
	// 			type: 'web_hook',
	// 			address: 'https://biomems-toyo.vercel.app/api/reserve'
	// 		}
	// 	},
	// 	function (err: any, event: any) {}
	// );
}
