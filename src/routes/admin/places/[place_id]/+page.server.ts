import db from '$lib/server/database';
import { checkAuth } from '$lib/server/utils.js';
import { error } from '@sveltejs/kit';
import { getAuthLocals } from 'svelte-google-auth/server';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, locals }) {
	const user = await checkAuth(locals);
	if (!user || !user.admin) {
		return { place: null };
	}
	const user_db = await db.oneOrNone('SELECT * FROM "user" WHERE email = $1', [user.email]);

	if (!user_db) {
		return { authorized: false };
	}
	function parseRow(data: any) {
		return {
			id: data['id'] as string,
			name: data['name'] as string,
			description: data['description'] as string | undefined,
			place: data['place.id']
				? { id: data['place.id'] as string, name: data['place.name'] as string }
				: undefined
		};
	}
	const place = await db.oneOrNone('SELECT * FROM place WHERE id = $1', [params.place_id]);
	if (!place) {
		throw error(404, 'Not found');
	}

	return { place: parseRow(place), authorized: true };
}
