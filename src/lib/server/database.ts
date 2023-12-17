import { DB_DATABASE, DB_PORT, DB_HOST, DB_USER, DB_PASSWORD } from '$env/static/private';

import pg from 'pg-promise';
const pgp = pg();
console.log(process.env, DB_DATABASE);
// DB接続情報
const initOptions = {
	host: DB_HOST,
	port: Number(DB_PORT),
	database: DB_DATABASE,
	user: DB_USER,
	password: DB_PASSWORD
};

console.log(initOptions);
// DB接続
const db = pgp(initOptions);

// デフォルトエクスポートとしてdbを返す
export default db;
