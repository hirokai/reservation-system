import type { RequestHandler } from '@sveltejs/kit';
import db from '$lib/server/database';
import { nanoid } from 'nanoid';

/** @type {import('./$types').RequestHandler} */
export const POST: RequestHandler = async ({ request, cookies }) => {
	console.log('Loggin in');
	if (!request.body) {
		return new Response(String('No body'), { status: 400 });
	}

	const session_id = 'S_' + nanoid();
	await db.query('INSERT INTO user_session (session_id,"user") VALUES ($1)', [session_id]);

	cookies.set('myself_id', 'u1', { path: '/', sameSite: 'lax' });
	cookies.set('session_id', session_id, { path: '/', sameSite: 'lax' });
	const rs = { ok: true };
	return new Response(JSON.stringify(rs), { status: 200 });
};
