import type { RequestHandler } from '@sveltejs/kit';
import db from '$lib/server/database';
import { checkAuth } from '$lib/server/utils';

export const DELETE: RequestHandler = async ({ locals, request, params }) => {
	const user = await checkAuth(locals);
	if (!user?.email) {
		return new Response(String('Not admin'), { status: 401 });
	}
	if (!request.body) {
		return new Response(String('No body'), { status: 400 });
	}
	const data1 = await request.json();
	const id = params.id;
	const equipment = data1.equipment as string | undefined;
	const r = await db.query('DELETE FROM "reservation" WHERE id=$1', [id]);

	if (equipment) {
		const reservations = (await db.query(
			'SELECT * FROM "reservation" WHERE equipment = $1',
			equipment
		)) as {
			equipment: string;
			user: string;
			id: string;
			start_time: Date;
			end_time: Date;
			timestamp: Date;
		}[];
		return new Response(JSON.stringify({ ok: true, reservations }), { status: 200 });
	} else {
		return new Response(JSON.stringify({ ok: true }), { status: 200 });
	}
};
