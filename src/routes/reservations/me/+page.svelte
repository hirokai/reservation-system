<script lang="ts">
	import { formatTime } from '$lib/utils';

	/** @type {import('./$types').PageData}*/
	export let data;
	export const ssr = false;

	$: reservations = data.reservations;
	const cancel = (eq: string, id: string) => {
		const r = confirm('本当にキャンセルしますか？');
		if (!r) {
			return;
		}
		fetch('/api/reserve/' + id, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				equipment: eq
			})
		})
			.then((res) => res.json())
			.then((res) => {
				console.log({ res });
				reservations = res.reservations.map(
					(r: {
						id: string;
						user: string;
						start_time: string;
						end_time: string;
						comment: string | undefined;
					}) => {
						return {
							id: r.id,
							user: r.user,
							start_time: new Date(r.start_time),
							end_time: new Date(r.end_time),
							comment: r.comment
						};
					}
				);
			});
	};
</script>

<main>
	<h1>自分の予約一覧</h1>
	<table>
		<thead>
			<tr>
				<th>装置</th>
				<th>開始時刻</th>
				<th>終了時刻</th>
				<th>コメント</th>
			</tr>
		</thead>
		<tbody>
			{#each reservations as r}
				<tr>
					<td class="w-24">
						<a href="/equipments/{r.equipment}" class="hover:underline">
							{data.equipments[r.equipment].name}
						</a>
					</td><td class="w-40">{formatTime(r.start_time)}</td><td class="w-40"
						>{formatTime(r.end_time)}</td
					>
					<td>{r.comment || ''}</td>
					<td>
						<button
							class="bg-pink-500 text-white active:bg-pink-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
							type="button"
							on:click={() => cancel(r.equipment, r.id)}>キャンセル</button
						>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</main>
