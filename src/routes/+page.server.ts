import db from '$lib/server/database';
import { error } from '@sveltejs/kit';
import {keyBy } from 'lodash-es';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
    const users = await db.query('SELECT * FROM "user"')
    const equipments = await db.query('SELECT * FROM "equipment"')
    const reservations = await db.query('SELECT * FROM "reservation"')
	return {
		users: keyBy(users, 'id') as {[id: string]: {id: string; name: string; email: string}},
        reservations: reservations as {equipment: string; user: string; id: string; start_time: number; end_time: number}[],
        equipments: equipments as {
            id: string;
            name: string;
            description: string;
        }[]
    }
}


/** @type {import('./$types').Actions} */
export const actions = {
	login: async ({request,cookies}) => {
		cookies.set('session_id', '1234', {
            maxAge: 86400,
            path: '/'
        });
        return {
            ok:""
        }
	}
};