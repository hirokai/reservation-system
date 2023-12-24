import { getAuthLocals } from 'svelte-google-auth/server';
import db from '$lib/server/database';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, locals }) {
	const user_db = await db.oneOrNone('SELECT * FROM "user" WHERE id = $1', [params.id]);
	const myself = user_db ? { id: user_db.id, email: user_db.email } : undefined;
	const user = await db.oneOrNone('SELECT * FROM "user" WHERE id = $1', [params.id]);
	return { user };
}
