import { getAuthLocals } from 'svelte-google-auth/server';
import db from '$lib/server/database';
import { checkAuth } from '$lib/server/utils.js';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, locals }) {
	const user_info = await checkAuth(locals);
	if (!user_info || !user_info.admin) {
		return { place: null };
	}
	const user_db = await db.oneOrNone('SELECT * FROM "user" WHERE id = $1', [params.id]);
	const myself = user_db ? { id: user_db.id, email: user_db.email } : undefined;
	const user = await db.oneOrNone('SELECT * FROM "user" WHERE id = $1', [params.id]);
	return { user };
}
