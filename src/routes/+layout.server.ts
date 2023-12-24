import db from '$lib/server/database';
import { groupBy, keyBy, mapValues } from 'lodash-es';

import { getAuthLocals, hydrateAuth, isSignedIn } from 'svelte-google-auth/server';

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ locals, params }) {
	const user = getAuthLocals(locals).user;
	// if (!user) {
	// 	redirect(300, '/');
	// }
	const email = user?.email;
	if (!isSignedIn(locals)) {
		// redirect(300,'/')
		// return {}
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
		id: params.id
	};
}
