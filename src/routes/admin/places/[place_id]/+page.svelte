<script lang="ts">
	import type PageServerData from './$types';
	export let data;
	let name: string = data.place?.name || '';
	let editing = false;
	$: place = data.place;
	let description = data.place?.description || '';
	$: place_id = place?.id;
	const clickEdit = () => {
		if (editing && data.place?.id) {
			// 編集完了
			fetch(`/api/admin/places/${place_id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					name,
					description
				})
			}).then(async (res) => {
				if (res.ok) {
					alert('編集しました。');
					place = await res.json();
				} else {
					alert('編集に失敗しました。');
				}
			});
		}
		editing = !editing;
	};
	const deletePlace = () => {
		if (editing && data.place?.id) {
			fetch(`/api/admin/places/${place_id}`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					name,
					description
				})
			}).then(async (res) => {
				if (res.ok) {
					alert('削除しました。');
					place = await res.json();
				} else {
					alert('削除に失敗しました。');
				}
			});
		}
	};
</script>

<main class="m-4">
	<ol class="breadcrumb my-3">
		<li class="crumb"><a class="anchor" href="/admin">管理</a></li>
		<li class="crumb-separator" aria-hidden>&rsaquo;</li>
		<li class="crumb"><a class="anchor" href="/admin/places">場所</a></li>
		<li class="crumb-separator" aria-hidden>&rsaquo;</li>
		<li>{name}</li>
	</ol>
	{#if !data.authorized}
		認証されていません。
	{:else}
		<h1>場所</h1>
		<!-- <pre>{JSON.stringify(data, null, 2)}</pre> -->
		<label for="name">名前</label>
		{#if editing}
			<input type="text" name="name" id="" bind:value={name} />
		{:else}
			<span>{name}</span>
		{/if}
		<br />
		<label for="name">概要</label>
		{#if editing}
			<input type="text" name="description" id="" bind:value={description} />
		{:else}
			<span>{description}</span>
		{/if}
		<br />
		<button on:click={clickEdit} class="inline btn variant-filled"
			>{editing ? '完了' : '編集'}</button
		>
		{#if editing}
			<button
				class="btn variant-soft my-3"
				on:click={() => {
					editing = false;
				}}>キャンセル</button
			>
			<button on:click={deletePlace} class="inline btn variant-ghost-error">削除</button>
		{/if}
	{/if}
</main>

<style>
	label {
		display: inline-block;
		margin: 0.5rem 0.5rem 0 0;
		font-weight: bold;
	}
</style>
