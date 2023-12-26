<script lang="ts">
	import type { PageServerData } from './$types.js';
	export let data;
	console.log(data.calendars);
	$: calendars = data.calendars;
</script>

<svelte:head>
	<title>Googleカレンダー連携 - 管理</title>
</svelte:head>

<main class="m-4">
	<ol class="breadcrumb my-3">
		<li class="crumb"><a class="anchor" href="/admin">管理</a></li>
		<li class="crumb-separator" aria-hidden>&rsaquo;</li>
		<li>Googleカレンダー</li>
	</ol>
	<h1>カレンダー</h1>
	<table class="my-table">
		<thead>
			<tr>
				<th>装置</th>
				<th>カレンダーID</th>
			</tr>
		</thead>
		<tbody>
			{#each calendars as c}
				<tr>
					<td
						><a href="/admin/equipments/{c.equipment.id}" class="my-link">{c.equipment.name}</a></td
					>
					<td class="text-xs">{c.gcalendar_id}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</main>
