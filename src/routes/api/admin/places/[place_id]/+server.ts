import { error, type RequestHandler } from '@sveltejs/kit';
import db from '$lib/server/database';
import { getAuthLocals } from 'svelte-google-auth/server';
import { checkAuth } from '$lib/server/utils';

export const PUT: RequestHandler = async ({ request, params, locals }) => {
	const user = await checkAuth(locals);
	if (!user) {
		return new Response(String('Not logged in'), { status: 401 });
	}
	if (!user.admin) {
		return new Response(String('Not admin'), { status: 401 });
	}

	const rawData = await request.json();
	if (rawData.name == '') {
		return new Response(String('Name must not be empty'), { status: 400 });
	}
	let place;
	if (rawData.name && rawData.description) {
		place = await db.query('UPDATE place SET name=$1,description=$2 WHERE id = $3 RETURNING *', [
			rawData.name,
			rawData.description,
			params.place_id
		]);
	} else if (rawData.name) {
		place = await db.query('UPDATE place SET name=$1 WHERE id = $2 RETURNING *', [
			rawData.name,
			params.place_id
		]);
	} else if (rawData.description) {
		place = await db.query('UPDATE place SET description=$1 WHERE id = $2 RETURNING *', [
			rawData.description,
			params.place_id
		]);
	} else {
		// No operation
		return new Response(String('No operation'), { status: 304 });
	}

	function parseRow(data: any) {
		return {
			id: data.id as string,
			name: data.name as string,
			description: data.description as string | undefined
		};
	}
	return new Response(JSON.stringify({ place: parseRow(place) }), {
		status: 200
	});
};

export const DELETE: RequestHandler = async ({ request, params, locals }) => {
	const user = await checkAuth(locals);
	if (!user) {
		return new Response(String('Not logged in'), { status: 401 });
	}
	if (!user.admin) {
		return new Response(String('Not admin'), { status: 401 });
	}

	const r = await db.oneOrNone('DELETE FROM "place" WHERE id=$1 RETURNING id', [params.place_id]);
	if (!r) {
		return new Response(String('No such place'), { status: 404 });
	}
	return new Response(JSON.stringify({ ok: true }), { status: 200 });
};
