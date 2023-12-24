import { getAuthLocals } from 'svelte-google-auth';
import db from '$lib/server/database';

export async function checkAuth(
	locals: App.Locals
): Promise<{ email: string; admin: boolean } | null> {
	const user = getAuthLocals(locals).user;
	if (!user) {
		return null;
	}
	const u = await db.oneOrNone('SELECT * FROM "user" WHERE email = $1', [user.email]);
	return { email: user.email, admin: u.role == 'admin' };
}