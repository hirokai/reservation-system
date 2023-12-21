import db from '$lib/server/database';
import { error } from '@sveltejs/kit';
import { keyBy } from 'lodash-es';
import { getAuthLocals } from 'svelte-google-auth/server';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, locals }) {
	const user = getAuthLocals(locals).user;
	const user_db = user
		? await db.oneOrNone('SELECT * FROM "user" WHERE email = $1', [user.email])
		: undefined;
	const myself = user_db ? { id: user_db.id, email: user_db.email } : undefined;

	const machine = await db.oneOrNone('SELECT * FROM equipment WHERE id = $1', params.equipment_id);
	if (!machine) {
		throw error(404, 'Not found');
	}
	const users = (await db.query('SELECT * FROM "user"')) as {
		id: string;
		name: string;
		email: string;
	}[];
	const reservations = (await db.query(
		'SELECT * FROM "reservation" WHERE equipment = $1',
		params.equipment_id
	)) as {
		equipment: string;
		user: string;
		id: string;
		start_time: Date;
		end_time: Date;
		timestamp: Date;
		comment: string | undefined;
	}[];
	const usersDict = keyBy(users, 'id') as {
		[id: string]: { id: string; name: string; email: string };
	};
	return {
		users: usersDict,
		myself,
		reservations: reservations as {
			equipment: string;
			user: string;
			id: string;
			start_time: Date;
			end_time: Date;
			comment: string | undefined;
		}[],
		equipment: machine as {
			id: string;
			name: string;
			description: string;
		}
	};
}

/** @type {import('./$types').Actions} */
export const actions = {
	reserve: async (event) => {
		// TODO register the user
		const formData = await event.request.formData();
		const rawData = {
			start_date: formData.get('start_date'),
			end_date: formData.get('end_date'),
			start_time: formData.get('start_time'),
			end_time: formData.get('end_time'),
			user: formData.get('user'),
			equipment: formData.get('equipment')
		};
		const data = {
			start_time: new Date(`${rawData.start_date} ${rawData.start_time}`),
			end_time: new Date(`${rawData.end_date} ${rawData.end_time}`),
			user: rawData.user,
			equipment: rawData.equipment
		};
		await db.query(
			'INSERT INTO reservation (start_time, end_time, "user", equipment) VALUES ($1, $2, $3, $4)',
			[data.start_time, data.end_time, data.user, data.equipment]
		);
	}
};
