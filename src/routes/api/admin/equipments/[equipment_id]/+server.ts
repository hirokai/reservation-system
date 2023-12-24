import type { RequestHandler } from '@sveltejs/kit';
import db from '$lib/server/database';
import { getAuthLocals } from 'svelte-google-auth/server';

export const PUT: RequestHandler = async ({ request, params, locals }) => {
	const user = getAuthLocals(locals).user;

	if (!user) {
		return new Response(String('Not logged in'), { status: 401 });
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
