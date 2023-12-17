import type { RequestHandler } from '@sveltejs/kit';
import db from '$lib/server/database';
import { getAuthLocals, hydrateAuth, isSignedIn } from 'svelte-google-auth/server';

/** @type {import('./$types').RequestHandler} */
export const POST: RequestHandler = async ({ request, cookies, locals }) => {
	const user = getAuthLocals(locals).user;

	if (!request.body) {
		return new Response(String('No body'), { status: 400 });
	}
	if (!user) {
		return new Response(String('Not logged in'), { status: 401 });
	}
	console.log(cookies.get('myself_id'));
	const data1 = await request.json();
	const rawData = {
		start_date: data1.start_date,
		end_date: data1.end_date,
		start_time: data1.start_time,
		end_time: data1.end_time,
		user: data1.user,
		equipment: data1.equipment
	};
	const data = {
		start_time: new Date(`${rawData.start_date} ${rawData.start_time}`),
		end_time: new Date(`${rawData.end_date} ${rawData.end_time}`),
		user: rawData.user,
		equipment: rawData.equipment
	};
	console.log({ data });
	await db.query(
		'INSERT INTO reservation (start_time, end_time, "user", equipment) VALUES ($1, $2, $3, $4)',
		[data.start_time, data.end_time, data.user, data.equipment]
	);

	const rs = (await db.query(
		'SELECT * FROM "reservation" WHERE equipment = $1',
		data.equipment
	)) as {
		equipment: string;
		user: string;
		id: string;
		start_time: Date;
		end_time: Date;
		timestamp: Date;
	}[];

	return new Response(JSON.stringify(rs), { status: 200 });
};
