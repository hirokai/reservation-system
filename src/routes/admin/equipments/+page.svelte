<script lang="ts">
	import { keyBy } from 'lodash-es';
	import type PageServerData from './$types';
	import { downloadFile } from '$lib/client/utils';
	export let data;
	$: showAdding = false;
	$: equipments = data.equipments;
	$: add_name = '';
	$: add_place = '';
	$: add_description = '';

	$: places = keyBy(data.places, 'id');

	$: errorMessage = '' as string | null;
	export function addEquipment() {
		if (add_name === '') {
			errorMessage = '名前は必須です。';
			return;
		}
		if (equipments.find((eq: any) => eq.name === add_name)) {
			errorMessage = '同じ名前の装置が既に存在します。';
			return;
		}
		fetch('/api/admin/equipments', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				name: add_name,
				place: add_place,
				description: add_description
			})
		})
			.then((res) => res.json())
			.then((res) => {
				equipments = res.equipments;
			});
	}
	export const showAddEquipment = (show: boolean) => {
		showAdding = show;
	};

	export const exportEquipments = () => {
		downloadFile('equipments.json', 'application/json', JSON.stringify(equipments, null, 2));
	};

	export let fileInput: HTMLInputElement;
	export const onFileSelect = (ev: any) => {
		let reader = new FileReader();
		const file = ev.target!.files[0];

		reader.onload = function () {
			const txt = reader.result;
			// サーバーでパーズする
			fetch('/api/admin/equipments', {
				method: 'POST',
				headers: {
					'Content-Type': 'text/csv'
				},
				body: txt
			})
				.then((res) => res.json())
				.then((res) => {
					places = keyBy(res.places, 'id');
					alert('インポートしました。');
				});
		};

		reader.onerror = function () {
			console.log(reader.error);
		};
		reader.readAsText(file);
	};
	export const importEquipments = () => {
		//
		fileInput.click();
	};
	export const downloadImportTemplate = () => {
		downloadFile(
			'places_template.csv',
			'text/csv',
			'名前,概要,（説明： 2行目以下にインポートしたい項目を列挙してください。）'
		);
	};
	const deleteAll = () => {
		if (confirm('本当にすべての装置を削除しますか？')) {
			fetch('/api/admin/equipments', {
				method: 'DELETE'
			}).then((res) => {
				if (res.ok) {
					alert('すべて削除しました。');
					places = {};
				} else {
					alert('削除に失敗しました。');
				}
			});
		}
	};
</script>

<svelte:head>
	<title>装置一覧 - 管理</title>
</svelte:head>

<main class="m-4">
	<ol class="breadcrumb my-3">
		<li class="crumb"><a class="anchor" href="/admin">管理</a></li>
		<li class="crumb-separator" aria-hidden>&rsaquo;</li>
		<li>装置</li>
	</ol>
	<h1>装置</h1>

	<table class="my-table">
		<thead>
			<tr>
				<th>名前</th>
				<th>場所</th>
				<th class="w-80">概要</th>
			</tr>
		</thead>
		<tbody>
			{#each equipments as eq}
				<tr
					><td><a href="/admin/equipments/{eq.id}" class="my-link">{eq.name}</a></td>
					<td
						><a href="/admin/places/{eq.place}" class="my-link">{places[eq.place]?.name || ''}</a
						></td
					>
					<td>{eq.description || ''}</td></tr
				>
			{/each}
		</tbody>
	</table>

	<div class="my-3">
		<button on:click={() => showAddEquipment(true)} class="inline btn variant-filled">追加</button>
	</div>

	<div>
		<input type="file" hidden accept="text/csv" bind:this={fileInput} on:change={onFileSelect} />

		<button on:click={importEquipments} class="my-3 inline btn variant-filled">インポート</button>
		<a href="" on:click={downloadImportTemplate}>インポート用の雛形</a>
		<br />
		<button on:click={exportEquipments} class="my-3 inline btn variant-filled">エクスポート</button>
		<br />
		<button on:click={deleteAll} class="my-3 inline btn variant-filled-error">すべて削除</button>
	</div>

	{#if showAdding}
		<div class="card w-1/2 m-4 p-4">
			<h2 class="text-lg">追加</h2>
			<!-- 名前、場所、概要を記入-->
			<label for="name">名前</label>
			<input type="text" id="name" name="name" class="input" bind:value={add_name} />
			<label for="place">場所</label>
			<select id="place" name="place" class="input" bind:value={add_place}>
				{#each places as place}
					<option value={place.id}>{place.name}</option>
				{/each}
			</select>
			<label for="description">概要</label>
			<input
				type="text"
				id="description"
				name="description"
				class="input"
				bind:value={add_description}
			/>
			<button class="btn variant-filled my-3" on:click={addEquipment}>送信</button>
			<button class="btn my-3" on:click={() => showAddEquipment(false)}>キャンセル</button>
			<span class="text-red-500">{errorMessage}</span>
		</div>
	{/if}
</main>
