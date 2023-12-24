import { getAuthLocals } from 'svelte-google-auth/server';
import db from '$lib/server/database';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, locals }) {
	const user = getAuthLocals(locals).user;
	const user_db = user
		? await db.oneOrNone('SELECT * FROM "user" WHERE email = $1', [user.email])
		: undefined;
	if (!user_db) {
		return { users: [], equipments: [] };
	}
	const myself = user_db ? { id: user_db.id, email: user_db.email } : undefined;
	const users = await db.query('SELECT * FROM "user"');
	// 装置一覧を取得する
	const equipments = await db.query('SELECT * FROM equipment');
	return { users, equipments };
}
