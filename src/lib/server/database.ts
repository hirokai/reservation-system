import pg from 'pg-promise';
const pgp = pg();

// DB接続情報
const initOptions = {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: "reservation_system",
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
};

console.log(initOptions);
// DB接続
const db = pgp(initOptions);

// デフォルトエクスポートとしてdbを返す
export default db;
