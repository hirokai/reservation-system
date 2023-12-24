import { error, type RequestHandler } from '@sveltejs/kit';
import db, { pgp } from '$lib/server/database';
import { getAuthLocals } from 'svelte-google-auth/server';
import Papa from 'papaparse';
import { keyBy, mapValues } from 'lodash-es';
import { checkAuth } from '$lib/server/utils';

/** @type {import('./$types').RequestHandler} */
export const POST: RequestHandler = async ({ request, cookies, locals }) => {
	const user = await checkAuth(locals);
	if (!user || !user.admin) {
		throw error(401, 'Not admin');
	}
	const typ = request.headers.get('content-type');
	let ids = [] as string[];
	if (typ == 'text/csv') {
		const rows = Papa.parse(await request.text(), { header: true, skipEmptyLines: true }).data;
		const places = await db.manyOrNone('SELECT * FROM place');
		const placesDict = mapValues(keyBy(places, 'name'), 'id');
		console.log({ placesDict });
		// https://stackoverflow.com/questions/37300997/multi-row-insert-with-pg-promise
		const dicts = rows.map((row: any) => ({
			name: row['名前'],
			description: row['概要'],
			model: row['機種'],
			place: placesDict[row['場所']] || null
		}));
		console.log({ dicts });
		const cs = new pgp.helpers.ColumnSet(['name', 'description', 'model', 'place'], {
			table: 'equipment'
		});
		const query = pgp.helpers.insert(dicts, cs);
		ids = (await db.manyOrNone(query + ' RETURNING id')).map((r) => r.id);
	} else if (typ == 'application/json') {
		const rawData = await request.json();
		if (!rawData.name) {
			return new Response(String('No name'), { status: 400 });
		}
		const a = await db.oneOrNone('SELECT 1 FROM equipment WHERE name = $1', [rawData.name]);
		if (!!a) {
			return new Response(String('Name already exists'), { status: 400 });
		}
		ids = [
			(
				await db.oneOrNone(
					'INSERT INTO equipment (name,description,place) VALUES ($1,$2,$3) RETURNING id',
					[rawData.name, rawData.description, rawData.place || null]
				)
			).id
		];
	} else {
		return new Response(String('Invalid content type'), { status: 400 });
	}
	const equipments = await db.manyOrNone('SELECT * FROM equipment');
	function parseRow(data: any) {
		return { id: data.id, name: data.name, description: data.descriptionm, place: data.place };
	}
	return new Response(JSON.stringify({ equipments: equipments.map(parseRow), ids }), {
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

	const ids = (await db.query('DELETE FROM equipment')).map((r: any) => r.id) as string[];

	return new Response(JSON.stringify({ ids }), {
		status: 200
	});
};
