import type { RequestHandler } from '@sveltejs/kit';
import db from '$lib/server/database';

export const DELETE: RequestHandler = async ({ request, params }) => {
	if (!request.body) {
		return new Response(String('No body'), { status: 400 });
	}
	console.log(request.body.toString());
	const data1 = await request.json();
	const id = params.id;
	const equipment = data1.equipment as string | undefined;
	const r = await db.query('DELETE FROM "reservation" WHERE id=$1', [id]);

	console.log({ id, r });
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
