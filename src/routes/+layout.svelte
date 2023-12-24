<script lang="ts">
	import '../app.postcss';

	import { AppShell, AppBar } from '@skeletonlabs/skeleton';
	import { signIn, signOut, initialize } from 'svelte-google-auth/client';
	import { page } from '$app/stores';
	import { invalidateAll } from '$app/navigation';
	import type LayoutServerLoad from './$types';

	export let data;
	console.log(data.equipmentsByRoom);
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
	$: admin = $page.url.pathname.startsWith('/admin');
	initialize(data, invalidateAll);
</script>

<!-- https://www.skeleton.dev/blog/how-to-implement-a-responsive-sidebar-drawer -->
<AppShell slotSidebarLeft="bg-surface-500/5 w-0 sm:w-60">
	<svelte:fragment slot="sidebarLeft">
		<nav class="list-nav">
			{#if admin}
				<h1><a href="/admin">管理画面</a></h1>
				<h2 class={$page.url.pathname.startsWith('/admin/places') ? 'bg-primary-500' : ''}>
					<a href="/admin/places">場所</a>
				</h2>
				<h2 class={$page.url.pathname.startsWith('/admin/equipments') ? 'bg-primary-500' : ''}>
					<a href="/admin/equipments">装置</a>
				</h2>
				<h2 class={$page.url.pathname.startsWith('/admin/users') ? 'bg-primary-500' : ''}>
					<a href="/admin/users">ユーザー</a>
				</h2>
				<h2 class={$page.url.pathname.startsWith('/admin/reservations') ? 'bg-primary-500' : ''}>
					<a href="/admin/reservations">予約</a>
				</h2>
			{:else}
				<h1><a href="/reservations/me">自分の予約</a></h1>
				<h1>装置一覧</h1>
				{#each Object.entries(data.equipmentsByRoom) as [room, equipments]}
					<h2>
						{room}
					</h2>
					{#each Object.values(equipments) as equipment}
						<li class="list-none my-0 p-0 text-sm">
							<a
								href="/equipments/{equipment.id}"
								class="hover:underline p-0 m-0 {$page.url.pathname.startsWith(
									'/equipments/' + equipment.id
								)
									? 'bg-primary-500 hover:bg-primary-500'
									: ''}">{equipment.name}</a
							>
						</li>
					{/each}
				{/each}
			{/if}
		</nav>
	</svelte:fragment>
	<svelte:fragment slot="header">
		<AppBar regionRowMain="h-8" regionRowHeadline="h-0">
			<svelte:fragment slot="lead"
				><span class="font-bold"><a href="/equipments">装置予約システム</a></span></svelte:fragment
			>
			<!-- {data.auth.user?.name}({data.auth.user?.email}) -->
			{#if !!data.auth.user?.email}
				<span>ログイン済 ({data.auth.user?.email.slice(0, 3) + '...'})</span>{/if}

			<svelte:fragment slot="trail">
				{#if admin}
					<a class="btn variant-soft" href="/equipments">予約画面へ</a>
				{:else}
					<a class="btn variant-soft" href="/admin">管理画面へ</a>
				{/if}

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

<style>
	h2 {
		@apply text-base font-normal;
	}
</style>
