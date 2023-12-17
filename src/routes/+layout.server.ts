import db from '$lib/server/database';
import { redirect } from '@sveltejs/kit';
import { keyBy } from 'lodash-es';

import { getAuthLocals, hydrateAuth, isSignedIn } from 'svelte-google-auth/server';

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ locals }) {
	const user = getAuthLocals(locals).user;
	console.log('load...', user?.email);
	// if (!user) {
	// 	redirect(300, '/');
	// }
	const email = user?.email;
	if (!isSignedIn(locals)) {
		// redirect(300,'/')
		// return {}
	}
	const machines = await db.manyOrNone('SELECT * FROM equipment');
	const users = await db.query('SELECT * FROM "user"');
	return {
		...hydrateAuth(locals),
		users: keyBy(users, 'id') as { [id: string]: { id: string; name: string; email: string } },

		equipments: machines as {
			id: string;
			name: string;
			description: string;
		}[]
	};
}
