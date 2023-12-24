<script lang="ts">
	import { TabGroup, Tab, TabAnchor } from '@skeletonlabs/skeleton';
	let tabSet: number = 0;
	import type PageServerData from './$types';
	export let data;
	let name: string = data.equipment?.name || '';
	let editing = false;
	let edit_place: string = data.equipment?.place?.id || '';
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
</script>

<main class="m-4">
	<ol class="breadcrumb my-3">
		<li class="crumb"><a class="anchor" href="/admin">管理</a></li>
		<li class="crumb-separator" aria-hidden>&rsaquo;</li>
		<li class="crumb"><a class="anchor" href="/admin/equipments">装置</a></li>
		<li class="crumb-separator" aria-hidden>&rsaquo;</li>
		<li>{name}</li>
	</ol>
	{#if !data.authorized}
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
