<script lang="ts">
	/** @type {import('./$types').LayoutServerLoad} */

	export let data;
</script>

<svelte:head>
	<title>装置予約システム</title>
</svelte:head>

<main class="gap-4 p-4">
	<h1><a href="/reservations/me">自分の予約一覧</a></h1>

	<h1>装置一覧</h1>
	<table>
		<tbody>
			{#each data.equipments as eq}
				<tr><td><a href="/equipments/{eq.id}" class="hover:underline">{eq.name}</a></td></tr>
			{/each}
		</tbody>
	</table>
</main>

<style>
	/* Add your styles here */
</style>
