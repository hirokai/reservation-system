import { getAuthLocals } from 'svelte-google-auth';
import db from '$lib/server/database';
import { ALLOWED_EMAIL_DOMAIN } from '$env/static/private';

export async function checkAuth(
	locals: App.Locals
): Promise<{ email: string; admin: boolean } | null> {
	const user = getAuthLocals(locals).user;
	if (!user) {
		return null;
	}
	if (ALLOWED_EMAIL_DOMAIN && !user.email.endsWith(ALLOWED_EMAIL_DOMAIN)) {
		return null;
	}
	const u = await db.oneOrNone('SELECT * FROM "user" WHERE email = $1', [user.email]);
	if (!u) {
		return null;
	}
	return { email: user.email, admin: u.role == 'admin' };
}
