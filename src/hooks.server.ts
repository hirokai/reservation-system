import { SvelteGoogleAuthHook } from 'svelte-google-auth/server';
import type { Handle } from '@sveltejs/kit';
import { CLIENT_SECRET } from '$env/static/private';
// Import client credentials from json file
// import client_secret from '../client_secret.json';

const auth = new SvelteGoogleAuthHook(JSON.parse(CLIENT_SECRET).web);

export const handle: Handle = async ({ event, resolve }) => {
	return await auth.handleAuth({ event, resolve });
};
