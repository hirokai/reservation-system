import type { RequestHandler } from '@sveltejs/kit';
import db from '$lib/server/database';
import { checkAuth } from '$lib/server/utils';
import type { EquipmentId, ReservationId } from '$lib/types';
import { deleteCalendarEvent, deleteCalendarForEquipment } from '$lib/server/gcalendar';

export const DELETE: RequestHandler = async ({ locals, request, params }) => {
	const user = await checkAuth(locals);
	if (!user?.email) {
		return new Response(String('Not logged in'), { status: 401 });
	}
	if (!request.body) {
		return new Response(String('No body'), { status: 400 });
	}
	const data1 = await request.json();
	const id = params.id;
	const equipment = data1.equipment as string | undefined;

	const g_events = await db.manyOrNone(
		'DELETE FROM gcalendar_event_for_reservation WHERE reservation = $1 RETURNING *',
		[id]
	);
	for (const e of g_events) {
		const cid = e.gcalendar_id as string;
		const eid = e.gcalendar_event_id as string;
		const r = e.reservation as ReservationId;
		deleteCalendarEvent(cid, eid).then((r: { ok: boolean }) => {
			if (r.ok) {
				console.log(`Deleted event ${eid} from calendar ${cid} for reservation ${r}`);
			} else {
				console.log(`Failed to delete event ${eid} from calendar ${cid} for reservation ${r}`);
			}
		});
	}
	const r = await db.query('DELETE FROM "reservation" WHERE id=$1', [id]);

	if (equipment) {
		const parseRow = (d: any) => {
			return {
				equipment: d.equipment as string,
				user_name: d.name as string,
				user_id: d.uid as string,
				id: d.eid as EquipmentId,
				start_time: d.start_time as Date,
				end_time: d.end_time as Date,
				timestamp: d.timestamp as Date
			};
		};
		const reservations = (
			await db.query(
				'SELECT r.equipment, u.name, u.id as uid, r.id as eid,start_time, end_time, "timestamp" FROM reservation r JOIN "user" u ON r."user"=u.id WHERE r.equipment = $1',
				equipment
			)
		).map(parseRow);
		return new Response(JSON.stringify({ ok: true, reservations }), { status: 200 });
	} else {
		return new Response(JSON.stringify({ ok: true }), { status: 200 });
	}
};
