import { error, type RequestHandler } from '@sveltejs/kit';
import db from '$lib/server/database';
import { checkAuth } from '$lib/server/utils';
import { shareCalendar } from '$lib/server/gcalendar';

export const POST: RequestHandler = async ({ locals, request, params }) => {
	const user = await checkAuth(locals);
	if (!user?.email) {
		return new Response(String('Not logged in'), { status: 401 });
	}
	if (!params.equipment_id) {
		return new Response(String('No equipment ID specified'), { status: 400 });
	}
	const gcalendar_id = (
		await db.oneOrNone('SELECT * FROM gcalendar_for_equipment WHERE equipment = $1', [
			params.equipment_id
		])
	)?.gcalendar_id as string | undefined;
	if (!gcalendar_id) {
		return new Response(String('Calendar not found'), { status: 404 });
	}
	const r = await shareCalendar(gcalendar_id, user.email);
	console.log('shareCalendar', r);
	return new Response(JSON.stringify({ ok: true }), { status: 200 });
};
