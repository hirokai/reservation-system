<script lang="ts">
	/** @type {import('./$types').LayoutServerLoad} */
	export const ssr = false;

	export let data;
</script>

<svelte:head>
	<title>装置予約システム</title>
</svelte:head>

<main class="gap-4 p-4">
	<ol class="breadcrumb">
		<li>装置予約</li>
	</ol>

	<h1>自分の予約</h1>
	<h1>スター付き</h1>
	<h1>すべての装置・設備</h1>
	{#each Object.entries(data.equipmentsByRoom) as [room, equipments]}
		<h2>
			{room}
		</h2>
		{#each Object.values(equipments) as equipment}
			<li class="list-none my-0 p-0 text-sm ml-3">
				<a href="/equipments/{equipment.id}" class="hover:underline p-0 m-0">{equipment.name}</a>
			</li>
		{/each}
	{/each}
</main>

<style>
	/* Add your styles here */
</style>
