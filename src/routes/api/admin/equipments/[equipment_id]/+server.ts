import { error, type RequestHandler } from '@sveltejs/kit';
import db from '$lib/server/database';
import { getAuthLocals } from 'svelte-google-auth/server';
import { checkAuth } from '$lib/server/utils';

export const PUT: RequestHandler = async ({ request, params, locals }) => {
	const user = await checkAuth(locals);
	if (!user || !user.admin) {
		throw error(401, 'Not admin');
	}

	const rawData = await request.json();
	if (!rawData.name) {
		return new Response(String('No name'), { status: 400 });
	}
	const r = await db.query('UPDATE equipment SET name=$1, place=$2 WHERE id = $3', [
		rawData.name,
		rawData.place,
		params.equipment_id
	]);

	const equipment = await db.manyOrNone('SELECT * FROM equipment WHERE id = $1', [
		params.equipment_id
	]);
	function parseRow(data: any) {
		return { id: data.id, name: data.name, description: data.description, place: data.place };
	}
	return new Response(JSON.stringify({ equipment: parseRow(equipment) }), {
		status: 200
	});
};
