import { DB_DATABASE, DB_PORT, DB_HOST, DB_USER, DB_PASSWORD } from '$env/static/private';
import { dev } from '$app/environment';

import pg from 'pg-promise';
export const pgp = pg();
// DB接続情報
const initOptions = {
	host: DB_HOST,
	port: Number(DB_PORT),
	database: DB_DATABASE,
	user: DB_USER,
	password: DB_PASSWORD,
	ssl: !dev
};

// DB接続
const db = pgp(initOptions);

// デフォルトエクスポートとしてdbを返す
export default db;
