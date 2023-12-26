<script lang="ts">
	import { TabGroup, Tab, TabAnchor } from '@skeletonlabs/skeleton';
	let tabSet: number = 0;
	import type PageServerData from './$types';
	export let data;
	$: equipment = data.equipment;
	let name: string = data.equipment?.name || '';
	let editing = false;
	let edit_place: string = data.equipment?.place?.id || '';
	$: calendarId = data.equipment?.gcalendar || '';
	const clickEdit = () => {
		if (editing && data.equipment?.id) {
			// 編集完了
			fetch(`/api/admin/equipments/${data.equipment.id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					name: name,
					place: edit_place
				})
			}).then((res) => {
				if (res.ok) {
					alert('編集しました。');
					location.reload();
				} else {
					alert('編集に失敗しました。');
				}
			});
		}
		editing = !editing;
	};
	const createCalendar = () => {
		if (!confirm('カレンダーを作成しますか？（作成は1時間に60回以下にしてください。）')) {
			return;
		}
		if (equipment?.id) {
			fetch(`/api/admin/equipments/${equipment.id}/calendar`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				}
			}).then(async (res) => {
				if (res.ok) {
					const data = await res.json();
					calendarId = data.id;
					if (data.created) {
						alert('カレンダーを作成しました。');
					} else {
						alert('カレンダーは既に存在します。');
					}
				} else {
					alert('カレンダーの作成に失敗しました。');
				}
			});
		}
	};
	const deleteCalendar = () => {
		if (!confirm('カレンダーを削除しますか？')) {
			return;
		}
		if (equipment?.id) {
			fetch(`/api/admin/equipments/${equipment.id}/calendar`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json'
				}
			}).then(async (res) => {
				if (res.ok) {
					calendarId = undefined;
					alert('カレンダーを削除しました。');
				} else {
					alert('カレンダーの削除に失敗しました。');
				}
			});
		}
	};
</script>

<main class="m-4">
	<ol class="breadcrumb my-3">
		<li class="crumb"><a class="anchor" href="/admin">管理</a></li>
		<li class="crumb-separator" aria-hidden>&rsaquo;</li>
		<li class="crumb"><a class="anchor" href="/admin/equipments">装置</a></li>
		<li class="crumb-separator" aria-hidden>&rsaquo;</li>
		<li>{name}</li>
	</ol>
	{#if !data.loggedIn}
		認証されていません。
	{:else}
		<h1 class="text-xl">
			装置の情報 <a
				href="/equipments/{data.equipment?.id}"
				class="my-3 inline text-sm btn variant-filled">予約画面へ</a
			>
		</h1>
		<!-- <pre>{JSON.stringify(data.equipment, null, 2)}</pre> -->
		<div>
			<label for="name">名前</label>
			{#if editing}
				<input class="w-60" type="text" name="name" id="" bind:value={name} />
			{:else}
				<span class="prop-value">{name}</span>
			{/if}
			<br />
			<label for="name">場所</label>
			{#if editing}
				<select id="place" name="place" class="input w-60 max-w-80" bind:value={edit_place}>
					{#each data.places || [] as place}
						<option value={place.id}>{place.name}</option>
					{/each}
				</select>
			{:else}
				<span class="prop-value">{data.equipment?.place?.name || '（未設定）'}</span>
			{/if}
			<br />
			<label for="name">カレンダーID</label>
			<span class="text-xs inline-block w-auto">{calendarId || '（未設定）'}</span>
			<br />
			<button
				on:click={calendarId ? deleteCalendar : createCalendar}
				class="my-3 inline btn text-sm variant-filled{calendarId ? '-error' : ''}"
				>カレンダーを{calendarId ? '削除' : '作成'}</button
			>
		</div>
		<button on:click={clickEdit} class="my-3 inline btn variant-filled"
			>{editing ? '完了' : '編集'}</button
		>
		{#if editing}
			<button
				on:click={() => {
					editing = false;
				}}
				class="my-3 inline btn variant-soft">キャンセル</button
			>
		{/if}
	{/if}
</main>

<style>
	label {
		display: inline-block;
		margin: 0.5rem 0.5rem 0 0;
		font-weight: bold;
	}
	.prop-value {
		@apply inline-block w-60;
		border: 1px solid #222;
	}
</style>
