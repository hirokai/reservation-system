import { getAuthLocals } from 'svelte-google-auth/server';
import db from '$lib/server/database';
import { checkAuth } from '$lib/server/utils.js';
/** @type {import('./$types').PageServerLoad} */
export async function load({ params, locals }) {
	const user = await checkAuth(locals);
	if (!user || !user.admin) {
		return { users: [], equipments: [] };
	}
	const equipments = await db.manyOrNone('SELECT * FROM equipment');
	function parseRow(data: any) {
		return {
			id: data.id,
			name: data.name,
			description: data.description,
			model: data.model,
			place: data.place
		};
	}
	const places = await db.manyOrNone('SELECT * FROM place');
	function parseRowPlace(data: any) {
		return {
			id: data.id,
			name: data.name,
			description: data.description
		};
	}
	return { equipments: equipments.map(parseRow), places: places.map(parseRowPlace) };
}
