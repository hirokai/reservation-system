<script lang="ts">
	import { AppShell, AppBar } from '@skeletonlabs/skeleton';
	import { signIn, signOut, initialize } from 'svelte-google-auth/client';
	import { invalidateAll } from '$app/navigation';
	/** @type {import('./$types').LayoutServerLoad} */
	export let data;
	const login = () => {
		console.log('Logging in');
		fetch('/api/login', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ email: '', password: '' })
		});
	};
	initialize(data, invalidateAll);
</script>

<!-- https://www.skeleton.dev/blog/how-to-implement-a-responsive-sidebar-drawer -->
<AppShell slotSidebarLeft="bg-surface-300/5 w-0 lg:w-32">
	<svelte:fragment slot="sidebarLeft">
		<nav class="list-nav">
			<h1>装置一覧</h1>
			<ul>
				{#each Object.values(data.equipments) as equipment}
					<li class="list-none h-6">
						<a href="/equipments/{equipment.id}" class="hover:underline">{equipment.name}</a>
					</li>
				{/each}
			</ul>
		</nav>
	</svelte:fragment>
	<svelte:fragment slot="header">
		<AppBar regionRowMain="h-8" regionRowHeadline="h-0">
			<svelte:fragment slot="lead"
				><span class="font-bold"><a href="/">装置予約システム</a></span></svelte:fragment
			>
			<!-- {data.auth.user?.name}({data.auth.user?.email}) -->
			{#if !!data.auth.user?.email}
				<span>ログイン済</span>{/if}

			<svelte:fragment slot="trail">
				{#if !!data.auth.user?.email}
					<button class="btn variant-soft" on:click={() => signOut()}>ログアウト</button>
				{:else}
					<button class="btn variant-soft" on:click={() => signIn()}>ログイン</button>
				{/if}
			</svelte:fragment>
		</AppBar>
	</svelte:fragment>
	<slot />
</AppShell>
