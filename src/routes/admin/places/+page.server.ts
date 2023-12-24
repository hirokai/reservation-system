import { getAuthLocals } from 'svelte-google-auth/server';
import db from '$lib/server/database';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, locals }) {
	const places = await db.manyOrNone('SELECT * FROM place');
	function parseRow(data: any) {
		return {
			id: data.id,
			name: data.name,
			description: data.description
		};
	}
	return { places: places.map(parseRow) };
}
