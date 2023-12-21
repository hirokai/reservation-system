import db from '$lib/server/database';
import { error } from '@sveltejs/kit';
import { keyBy, sortBy } from 'lodash-es';
import { getAuthLocals } from 'svelte-google-auth/server';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, locals }) {
	const user = getAuthLocals(locals).user;
	const user_db = user
		? await db.oneOrNone('SELECT * FROM "user" WHERE email = $1', [user.email])
		: undefined;
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
