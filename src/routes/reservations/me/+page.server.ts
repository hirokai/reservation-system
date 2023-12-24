import db from '$lib/server/database';
import { checkAuth } from '$lib/server/utils.js';
import { error } from '@sveltejs/kit';
import { keyBy, sortBy } from 'lodash-es';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, locals }) {
	const user = await checkAuth(locals);
	if (!user?.email) {
		throw error(401, 'Not logged in');
	}
	const user_db = await db.oneOrNone('SELECT * FROM "user" WHERE email = $1', [user.email]);
	const myself = user_db ? { id: user_db.id, email: user_db.email } : undefined;
	let equipments: {
		[id: string]: {
			id: string;
			name: string;
			description: string;
		};
	} = keyBy(await db.manyOrNone('SELECT * FROM equipment'), 'id');

	const reservations = (
		myself ? await db.query('SELECT * FROM "reservation" WHERE "user" = $1', myself.id) : []
	) as {
		equipment: string;
		user: string;
		id: string;
		start_time: Date;
		end_time: Date;
		timestamp: Date;
		comment: string | undefined;
	}[];
	return {
		myself,
		reservations: sortBy(reservations, 'start_time'),
		equipments
	};
}
