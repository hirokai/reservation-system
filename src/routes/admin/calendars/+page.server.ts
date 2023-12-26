import db from '$lib/server/database';
import { checkAuth } from '$lib/server/utils.js';
import type { EquipmentId } from '$lib/types.js';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, locals }) {
	const user = await checkAuth(locals);
	if (!user || !user.admin) {
		return { calendars: [], admin: false };
	}
	const calendars = await db.manyOrNone(
		'SELECT gcalendar_id,e.name,e.id FROM gcalendar_for_equipment c LEFT JOIN equipment e ON c.equipment = e.id'
	);
	const parseRow = (d: any) => {
		return {
			equipment: { id: d.id as EquipmentId, name: d.name as string },
			gcalendar_id: d.gcalendar_id
		};
	};
	return { calendars: calendars.map(parseRow), admin: true };
}
