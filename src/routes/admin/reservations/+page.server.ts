import db from '$lib/server/database';
import { checkAuth } from '$lib/server/utils.js';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, locals }) {
	const user = await checkAuth(locals);
	if (!user || !user.admin) {
		return { place: null };
	}

	const reservations = await db.manyOrNone(
		'SELECT * FROM reservation r LEFT JOIN gcalendar_event_for_reservation c ON r.id = c.reservation'
	);
	const calendars = await db.manyOrNone(
		'SELECT * FROM reservation r LEFT JOIN gcalendar_event_for_reservation c ON r.id = c.reservation'
	);
	function parseRow(data: any) {
		return {
			id: data.id,
			user: data.user,
			equipment: data.equipment,
			comment: data.comment,
			gcalendar: data.gcalendar_event_id
		};
	}
	return { reservations: reservations.map(parseRow) };
}
