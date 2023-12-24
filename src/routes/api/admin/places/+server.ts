import type { RequestHandler } from '@sveltejs/kit';
import db from '$lib/server/database';
import { pgp } from '$lib/server/database';
import { getAuthLocals } from 'svelte-google-auth/server';
import Papa from 'papaparse';
import { checkAuth } from '$lib/server/utils';

/** @type {import('./$types').RequestHandler} */
export const POST: RequestHandler = async ({ request, cookies, locals }) => {
	const user = await checkAuth(locals);

	if (!user) {
		return new Response(String('Not logged in'), { status: 401 });
	}
	if (!user.admin) {
		return new Response(String('Not admin'), { status: 401 });
	}

	const typ = request.headers.get('content-type');
	let ids = [] as string[];
	if (typ == 'text/csv') {
		const rows = Papa.parse(await request.text(), { header: true, skipEmptyLines: true }).data;
		// https://stackoverflow.com/questions/37300997/multi-row-insert-with-pg-promise
		const dicts = rows.map((row: any) => ({ name: row['名前'], description: row['概要'] }));
		const cs = new pgp.helpers.ColumnSet(['name', 'description'], { table: 'place' });
		const query = pgp.helpers.insert(dicts, cs);
		ids = (await db.manyOrNone(query + ' RETURNING id')).map((r) => r.id);
	} else if (typ == 'application/json') {
		const rawData = await request.json();
		if (!rawData.name) {
			return new Response(String('No name'), { status: 400 });
		}
		const a = await db.oneOrNone('SELECT 1 FROM place WHERE name = $1', [rawData.name]);
		if (!!a) {
			return new Response(String('Name already exists'), { status: 400 });
		}
		ids = (
			await db.query('INSERT INTO place (name,description) VALUES ($1,$2) RETURNING id', [
				rawData.name,
				rawData.description
			])
		).map((r: any) => r.id);
	}
	const places = await db.manyOrNone('SELECT * FROM place');
	function parseRow(data: any) {
		return { id: data.id, name: data.name, description: data.description };
	}
	return new Response(JSON.stringify({ places: places.map(parseRow), ids }), {
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

	const ids = (await db.query('DELETE FROM place')).map((r: any) => r.id) as string[];

	return new Response(JSON.stringify({ ids }), {
		status: 200
	});
};
