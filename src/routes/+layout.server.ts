import db from '$lib/server/database';
import { checkAuth } from '$lib/server/utils.js';
import { error } from '@sveltejs/kit';
import { groupBy, keyBy, mapValues } from 'lodash-es';

import { getAuthLocals, hydrateAuth, isSignedIn } from 'svelte-google-auth/server';

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ locals, params }) {
	const user = await checkAuth(locals);
	if (!user) {
		return {
			...hydrateAuth(locals),
			users: {},
			equipmentsByRoom: {},
			id: params.id,
			loggedIn: false
		};
	}
	const equipments = await db.manyOrNone('SELECT id,place,name FROM equipment');
	const places = mapValues(keyBy(await db.manyOrNone('SELECT id,name FROM place'), 'id'), 'name');
	const users = await db.query('SELECT * FROM "user"');
	const parseRow = (data: any) => {
		return {
			id: data.id,
			name: data.name,
			place_name: places[data.place]
		};
	};
	return {
		...hydrateAuth(locals),
		users: keyBy(users, 'id') as { [id: string]: { id: string; name: string; email: string } },
		equipmentsByRoom: groupBy(equipments.map(parseRow), 'place_name'),
		id: params.id,
		loggedIn: true
	};
}
