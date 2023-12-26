import db from '$lib/server/database';
import { checkAuth } from '$lib/server/utils.js';
import type { EquipmentId, ReservationId, UserId } from '$lib/types.js';
import { error } from '@sveltejs/kit';
import { keyBy } from 'lodash-es';

export const ssr = false;

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, locals }) {
	const user = await checkAuth(locals);
	if (!user) {
		throw error(401, 'Not logged in');
	}
	const user_db = await db.oneOrNone('SELECT * FROM "user" WHERE email = $1', [user.email]);
	const myself = user_db ? { id: user_db.id, email: user_db.email } : undefined;

	const parseEq = (d: any | undefined) => {
		return !d
			? undefined
			: {
					id: d.id as EquipmentId,
					name: d.name as string,
					description: d.description as string,
					gcalendarEnabled: d.gcalendar_id !== null
				};
	};

	const equipment = parseEq(
		await db.oneOrNone(
			'SELECT * FROM equipment e LEFT JOIN gcalendar_for_equipment c ON e.id=c.equipment WHERE e.id = $1',
			params.equipment_id
		)
	);
	if (!equipment) {
		throw error(404, 'Not found');
	}

	const users = (await db.query('SELECT * FROM "user"')) as {
		id: string;
		name: string;
		email: string;
	}[];
	const parseReservation = (d: any) => {
		return {
			equipment: d.equipment as string,
			user_name: d.name as string,
			user_id: d.uid as UserId,
			id: d.id as ReservationId,
			start_time: d.start_time as Date,
			end_time: d.end_time as Date,
			comment: d.comment as string | undefined
		};
	};
	const reservations = (
		await db.manyOrNone(
			'SELECT r.id, r.equipment, r.start_time, r.end_time, r.comment, u.name, u.id as uid FROM reservation r JOIN "user" u ON r."user"=u.id WHERE equipment = $1',
			params.equipment_id
		)
	).map(parseReservation);
	const usersDict = keyBy(users, 'id') as {
		[id: string]: { id: string; name: string; email: string };
	};
	return {
		users: usersDict,
		myself,
		reservations,
		equipment
	};
}

/** @type {import('./$types').Actions} */
export const actions = {
	reserve: async (event) => {
		// TODO register the user
		const formData = await event.request.formData();
		const rawData = {
			start_date: formData.get('start_date'),
			end_date: formData.get('end_date'),
			start_time: formData.get('start_time'),
			end_time: formData.get('end_time'),
			user: formData.get('user'),
			equipment: formData.get('equipment')
		};
		const data = {
			start_time: new Date(`${rawData.start_date} ${rawData.start_time}`),
			end_time: new Date(`${rawData.end_date} ${rawData.end_time}`),
			user: rawData.user,
			equipment: rawData.equipment
		};
		await db.query(
			'INSERT INTO reservation (start_time, end_time, "user", equipment) VALUES ($1, $2, $3, $4)',
			[data.start_time, data.end_time, data.user, data.equipment]
		);
	}
};
