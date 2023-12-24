import db from '$lib/server/database';
import { checkAuth } from '$lib/server/utils.js';
import { error } from '@sveltejs/kit';
import { getAuthLocals } from 'svelte-google-auth/server';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, locals }) {
	const user = await checkAuth(locals);
	if (!user || !user.admin) {
		return null;
	}
	const user_db = user
		? await db.oneOrNone('SELECT * FROM "user" WHERE email = $1', [user.email])
		: undefined;

	if (!user_db) {
		return { authorized: false };
	}
	function parseRow(data: any) {
		return {
			id: data['id'],
			name: data['name'],
			description: data['description'],
			place: data['pid'] ? { id: data['pid'], name: data['pname'] } : undefined
		};
	}
	const equipment = await db.oneOrNone(
		'SELECT e.id, e.name, p.id as pid, p.name as pname FROM equipment e LEFT JOIN place p ON e.place = p.id WHERE e.id = $1',
		[params.id]
	);
	if (!equipment) {
		throw error(404, 'Not found');
	}
	const places = await db.manyOrNone('SELECT * FROM place');
	function parseRowPlace(data: any) {
		return {
			id: data.id,
			name: data.name,
			description: data.description
		};
	}
	return {
		equipment: parseRow(equipment),
		places: places.map(parseRowPlace) || [],
		authorized: true
	};
}
