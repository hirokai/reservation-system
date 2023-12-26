import { error, type RequestHandler } from '@sveltejs/kit';
import { checkAuth } from '$lib/server/utils';
import { createCalendarForEquipment, deleteCalendarForEquipment } from '$lib/server/gcalendar';

export const POST: RequestHandler = async ({ request, params, locals }) => {
	const user = await checkAuth(locals);
	if (!user || !user.admin) {
		throw error(401, 'Not admin');
	}
	if (!params.equipment_id) {
		throw error(400, 'No equipment_id');
	}
	const r = await createCalendarForEquipment(params.equipment_id);
	return new Response(JSON.stringify(r), {
		status: 200
	});
};

export const DELETE: RequestHandler = async ({ request, params, locals }) => {
	const user = await checkAuth(locals);
	if (!user || !user.admin) {
		throw error(401, 'Not admin');
	}
	if (!params.equipment_id) {
		throw error(400, 'No equipment_id');
	}
	const r = await deleteCalendarForEquipment(params.equipment_id);
	console.log('deleteCalendarForEquipment', r);
	return new Response(JSON.stringify(r), {
		status: 200
	});
};
