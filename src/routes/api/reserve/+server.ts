import type { RequestHandler } from '@sveltejs/kit';
import db from '$lib/server/database';
import { getAuthLocals, hydrateAuth, isSignedIn } from 'svelte-google-auth/server';
import { nanoid } from 'nanoid';

function removeUndefined<T>(obj: T): T {
	if (obj == null) {
		return obj;
	}
	if (Array.isArray(obj)) {
		return obj;
	}
	const newObj = {} as T;
	Object.keys(obj).forEach((key) => {
		if ((obj as any)[key] === Object((obj as any)[key]))
			(newObj as any)[key] = removeUndefined((obj as any)[key]);
		else if ((obj as any)[key] !== undefined) (newObj as any)[key] = (obj as any)[key];
	});
	return newObj;
}

function generateId<T extends string>(head: T): `${T}${string}` {
	for (;;) {
		const s = `${head}${nanoid()}` as const;
		if (s.indexOf('-') == -1) {
			return s;
		}
	}
}

function generateUserId() {
	return generateId('U');
}

/** @type {import('./$types').RequestHandler} */
export const POST: RequestHandler = async ({ request, cookies, locals }) => {
	const user = getAuthLocals(locals).user;

	if (!request.body) {
		return new Response(String('No body'), { status: 400 });
	}
	if (!user) {
		return new Response(String('Not logged in'), { status: 401 });
	}
	const registered_user_id: string | undefined = (
		await db.oneOrNone('SELECT * FROM "user" WHERE email = $1', [user.email])
	)?.id;
	const user_id = registered_user_id ?? generateUserId();
	if (!registered_user_id) {
		// return new Response(String('Not registered'), { status: 401 });
		// 初めて予約するときにユーザー登録してしまう（デモ用の仮の処置）
		// 本来はユーザー登録画面を作る
		await db.query('INSERT INTO "user" (id,email,name) VALUES ($1,$2,$3)', [
			user_id,
			user.email,
			user.name
		]);
		cookies.set('user_id', user_id, { path: '/', sameSite: 'lax' });
	}
	const data1 = await request.json();
	const rawData = {
		start_date: data1.start_date,
		end_date: data1.end_date,
		start_time: data1.start_time,
		end_time: data1.end_time,
		equipment: data1.equipment
	};
	const data = {
		start_time: new Date(`${rawData.start_date} ${rawData.start_time}`),
		end_time: new Date(`${rawData.end_date} ${rawData.end_time}`),
		user: registered_user_id,
		equipment: rawData.equipment
	};
	console.log({ data });
	await db.query(
		'INSERT INTO reservation (start_time, end_time, "user", equipment) VALUES ($1, $2, $3, $4)',
		[data.start_time, data.end_time, data.user, data.equipment]
	);

	const reservations = (await db.query(
		'SELECT * FROM "reservation" WHERE equipment = $1',
		data.equipment
	)) as {
		equipment: string;
		user: string;
		id: string;
		start_time: Date;
		end_time: Date;
		timestamp: Date;
	}[];

	return new Response(
		JSON.stringify(
			removeUndefined({
				ok: true,
				reservations,
				new_user_id: registered_user_id ? undefined : user_id
			})
		),
		{
			status: 200
		}
	);
};
