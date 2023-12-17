<script lang="ts">
	import { onMount } from 'svelte';
	import { formatTime } from '$lib/utils';
	// data object is set from +page.ts
	export let data;
	import _ from 'lodash-es';
	// Define data type
	/** @type {import('./$types').PageData}*/
	/** @type {import('./$types').PageServerLoad} */
	import { TabGroup, Tab, TabAnchor } from '@skeletonlabs/skeleton';

	let selectMode: '1st' | '2nd' | 'none' = '1st';

	const formatDateHyphen = (time: Date) => {
		// 日付と時刻を指定する
		return `${time.getFullYear()}-${time.getMonth() + 1}-${time.getDate()}`;
	};
	const formatDateDayOnly = (date: Date) => {
		const daynames = ['日', '月', '火', '水', '木', '金', '土'];
		return `${date.getDate()}(${daynames[date.getDay()]})`;
	};
	$: tableSimple = {
		// A list of heading labels.
		head: ['予約者', '開始時刻', '終了時刻'],
		// The data visibly shown in your table body UI.
		body: (function (ds) {
			return ds.map((d) => {
				return [data.users[d.user].name, formatTime(d.start_time), formatTime(d.end_time)];
			});
		})(data.reservations)
	};
	let reserve_start_date: string;
	let reserve_end_date: string;
	// let reserve_start_time: string = '00:00';
	// let reserve_end_time: string = '00:00';
	let reserve_start_time_hour: number = 0;
	let reserve_start_time_min: number = 0;
	let reserve_end_time_hour: number = 0;
	let reserve_end_time_min: number = 0;
	$: reserve_start_time = reserve_start_time_hour + ':' + reserve_start_time_min;
	$: reserve_end_time = reserve_end_time_hour + ':' + reserve_end_time_min;

	$: reservations = data.reservations;

	onMount(() => {
		tableSimple = {
			// A list of heading labels.
			head: ['予約者', '開始時刻', '終了時刻'],
			// The data visibly shown in your table body UI.
			body: (function (ds) {
				return ds.map((d) => {
					return [data.users[d.user].name, formatTime(d.start_time), formatTime(d.end_time), ''];
				});
			})(data.reservations)
		};
		reserve_start_date = formatDateHyphen(new Date());
		reserve_end_date = formatDateHyphen(new Date());
	});
	let tabSet: number = 0;
	let dates = _.range(14).map((i: number) => {
		const date = new Date();
		date.setDate(date.getDate() + i);
		return date;
	});
	const formatDateShort = (date: Date) => {
		const daynames = ['日', '月', '火', '水', '木', '金', '土'];
		return `${date.getMonth() + 1}/${date.getDate()}(${daynames[date.getDay()]})`;
	};
	let time_slots = [
		0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23
	];
	const onClickCell = (date: Date, time: number) => (ev: MouseEvent) => {
		const rect = (ev.target as HTMLTableCellElement).getBoundingClientRect();
		console.log(ev.clientX - rect.left, ev.clientY - rect.top);
		console.log({ date, time });
		if (selectMode == '1st') {
			const d = formatDateHyphen(date);
			reserve_start_date = d;
			reserve_start_time_hour = time;
			reserve_start_time_min = 0;
			reserve_end_date = d;
			reserve_end_time_hour = time;
			reserve_end_time_min = 0;
			selectMode = '2nd';
		} else if (selectMode == '2nd') {
			const s = new Date(reserve_start_date);
			const e = new Date(reserve_end_date);
			const d = formatDateHyphen(date);
			if (date < s && time < reserve_start_time_hour) {
				reserve_end_time_hour = reserve_start_time_hour;
				reserve_end_time_min = reserve_start_time_min;
				reserve_end_date = reserve_start_date;
				reserve_start_date = d;
				reserve_start_time_hour = time;
				reserve_start_time_min = 0;
			} else {
				reserve_end_date = d;
				reserve_end_time_hour = time + 1;
				reserve_end_time_min = 0;
			}
			selectMode = '1st';
		}
	};
	const withinSelected = (
		date: Date,
		time: number,
		_s1: string,
		_s2: string,
		_e1: string,
		_e2: string
	) => {
		const d = new Date(date);
		d.setHours(time);
		d.setMinutes(0);
		d.setSeconds(0);
		d.setMilliseconds(0);
		const s = new Date(reserve_start_date);
		s.setHours(parseInt(reserve_start_time.split(':')[0]));
		s.setMinutes(0);
		const e = new Date(reserve_end_date);
		const delta =
			reserve_start_date == reserve_end_date && reserve_start_time == reserve_end_time ? 0 : 1;
		e.setHours(parseInt(reserve_end_time.split(':')[0]) - delta);
		e.setMinutes(0);
		if (s <= d && d <= e) {
			return true;
		} else {
			return false;
		}
	};
	const withinAny = (
		date: Date,
		time: number,
		reservations: { user: string; start_time: Date; end_time: Date }[]
	) => {
		const d = new Date(date);
		d.setHours(time);
		d.setMinutes(0);
		d.setSeconds(0);
		d.setMilliseconds(0);
		for (const r of reservations) {
			if (r.start_time <= d && d < r.end_time) {
				return true;
			}
		}
		return false;
	};

	const onClickReserve = () => {
		fetch('/api/reserve', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				start_date: reserve_start_date,
				start_time: reserve_start_time_hour + ':' + reserve_start_time_min,
				end_date: reserve_end_date,
				end_time: reserve_end_time_hour + ':' + reserve_end_time_min,
				equipment: data.equipment.id
			})
		})
			.then((res) => res.json())
			.then((res) => {
				if (!res.ok) {
					alert('予約に失敗しました');
					return;
				}
				console.log({ res });
				alert('予約しました');
				reservations = res.reservations.map(
					(r: { id: string; user: string; start_time: string; end_time: string }) => {
						return {
							id: r.id,
							user: r.user,
							start_time: new Date(r.start_time),
							end_time: new Date(r.end_time)
						};
					}
				);
				reserve_start_date = '';
				reserve_end_date = '';
				reserve_start_time_hour = 0;
				reserve_start_time_min = 0;

				reserve_end_time_hour = 0;
				reserve_end_time_min = 0;
			});
	};
	const cancel = (id: string) => {
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
				equipment: data.equipment.id
			})
		})
			.then((res) => res.json())
			.then((res) => {
				console.log({ res });
				reservations = res.reservations.map(
					(r: { id: string; user: string; start_time: string; end_time: string }) => {
						return {
							id: r.id,
							user: r.user,
							start_time: new Date(r.start_time),
							end_time: new Date(r.end_time)
						};
					}
				);
			});
	};
</script>

<svelte:head>
	<title>{data.equipment.name} - 装置予約システム</title>
</svelte:head>

<main class="gap-4">
	<h1 class="text-xl">装置の予約: {data.equipment.name}</h1>

	<div class="card m-2 p-4 w-5/6">
		<h2>予約する</h2>
		<label for="date" class="inline">開始日付</label>
		<input class="inline" type="date" id="date" name="start_date" bind:value={reserve_start_date} />
		<label class="inline" for="time">開始時刻</label>
		<select bind:value={reserve_start_time_hour}>
			{#each _.range(24) as i}
				<option value={i}>{i.toString().padStart(2, '0')}</option>
			{/each}
		</select>
		<select bind:value={reserve_start_time_min}>
			{#each [0, 15, 30, 45] as i}
				<option value={i}>{i.toString().padStart(2, '0')}</option>
			{/each}
		</select>

		<label class="inline" for="date">終了日付</label>
		<input class="inline" type="date" id="date" name="end_date" bind:value={reserve_end_date} />
		<label class="inline" for="duration">終了時刻</label>
		<select bind:value={reserve_end_time_hour}>
			{#each _.range(24) as i}
				<option value={i}>{i.toString().padStart(2, '0')}</option>
			{/each}
		</select>
		<select bind:value={reserve_end_time_min}>
			{#each [0, 15, 30, 45] as i}
				<option value={i}>{i.toString().padStart(2, '0')}</option>
			{/each}
		</select>
		<button
			on:click={onClickReserve}
			class="inline btn variant-filled"
			disabled={!data.auth.user?.email}>予約する</button
		>
		<div class="h-8 text-right" class:invisible={!!data.auth.user?.email}>
			予約するにはログインしてください
		</div>
	</div>
	<div class="m-2 p-4">
		<h2>予約一覧</h2>
		<TabGroup>
			<Tab bind:group={tabSet} name="tab1" value={0}>カレンダー表示</Tab>
			<Tab bind:group={tabSet} name="tab2" value={1}>
				<span>一覧表示</span>
			</Tab>
			<!-- Tab Panels --->
			<svelte:fragment slot="panel">
				{#if tabSet === 1}
					<div>
						<table class="w-5/6">
							<thead>
								<tr>
									<th>予約者</th>
									<th>開始時刻</th>
									<th>終了時刻</th>
								</tr>
							</thead>
							{#if reservations.length === 0}
								<tbody>
									<tr>
										<td colspan="3">予約はありません</td>
									</tr>
								</tbody>
							{:else}
								<tbody>
									{#each reservations as reservation}
										<tr>
											<td class="w-40">{data.users[reservation.user].name}</td>
											<td class="w-40">{formatTime(reservation.start_time)}</td>
											<td class="w-40">{formatTime(reservation.end_time)}</td>
											<td>
												{#if data.myself?.id && data.myself.id === reservation.user}
													<button
														class="bg-pink-500 text-white active:bg-pink-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
														type="button"
														on:click={() => cancel(reservation.id)}>キャンセル</button
													>
												{/if}
											</td>
										</tr>
									{/each}
								</tbody>
							{/if}
						</table>
					</div>
				{:else if tabSet === 0}
					<div class="overflow-scroll">
						<table class="border-collapse">
							<tbody>
								<tr>
									<td></td>
									{#each dates as date}
										<td class="w-8 h-8 text-center">{formatDateDayOnly(date)}</td>
									{/each}
								</tr>
								{#each time_slots as time}
									<tr>
										<td class="w-8 pr-2 text-right align-top text-sm">{time}</td>
										{#each dates as date}
											<td
												class="w-8 h-8 cursor-pointer hover:bg-blue-400 {withinSelected(
													date,
													time,
													reserve_start_date,
													reserve_start_time,
													reserve_end_date,
													reserve_end_time
												) && !withinAny(date, time, reservations)
													? 'bg-blue-400'
													: ''} {withinAny(date, time, reservations) ? 'bg-red-200' : ''}"
												style="border: 1px black solid"
												on:click={onClickCell(date, time)}>&nbsp;</td
											>
										{/each}
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}
			</svelte:fragment>
		</TabGroup>
	</div>
</main>

<style>
	/* Add your styles here */
</style>
