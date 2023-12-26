<script lang="ts">
	import type PageServerData from './$types';
	export let data;
</script>

<main class="m-4">
	<ol class="breadcrumb my-3">
		<li class="crumb"><a class="anchor" href="/admin">管理</a></li>
		<li class="crumb-separator" aria-hidden>&rsaquo;</li>
		<li>予約</li>
	</ol>
	{#if data.reservations}
		<table class="my-table">
			<thead>
				<tr>
					<th>ID</th>
					<th>装置</th>
					<th>ユーザー</th>
					<th>カレンダーイベントID</th>
				</tr>
			</thead>
			<tbody>
				{#each data.reservations as reservation}
					<tr>
						<td>{reservation.id}</td>
						<td>{reservation.equipment}</td>
						<td>{reservation.user}</td>
						<td>{reservation.gcalendar}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
</main>
