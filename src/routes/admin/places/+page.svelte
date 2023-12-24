<script lang="ts">
	import { downloadFile } from '$lib/client/utils';
	import type PageServerData from './$types';
	export let data;
	$: places = data.places;

	$: showAdding = false;
	$: add_name = '';
	$: add_description = '';

	$: errorMessage = '' as string | null;
	export function addPlace() {
		if (add_name === '') {
			errorMessage = '名前は必須です。';
			return;
		}
		if (places.find((eq: any) => eq.name === add_name)) {
			errorMessage = '同じ名前の装置が既に存在します。';
			return;
		}
		fetch('/api/admin/places', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				name: add_name,
				description: add_description
			})
		})
			.then((res) => res.json())
			.then((res) => {
				console.log({ res });
				places = res.places;
			});
	}
	export const showAddPlace = (show: boolean) => {
		showAdding = show;
	};
	export const importPlaces = () => {
		//
		fileInput.click();
	};
	export let fileInput: HTMLInputElement;
	export const onFileSelect = (ev: any) => {
		let reader = new FileReader();
		const file = ev.target!.files[0];
		console.log(file);

		reader.onload = function () {
			const txt = reader.result;
			// サーバーでパーズする
			fetch('/api/admin/places', {
				method: 'POST',
				headers: {
					'Content-Type': 'text/csv'
				},
				body: txt
			})
				.then((res) => {
					if (res.ok) {
						alert('インポートしました。');
					} else {
						alert('インポートに失敗しました。');
					}
					return res.json();
				})
				.then((res) => {
					places = res.places;
				});
		};

		reader.onerror = function () {
			console.log(reader.error);
		};
		reader.readAsText(file);
	};
	export const downloadImportTemplate = () => {
		downloadFile(
			'places_template.csv',
			'text/csv',
			'名前,概要,（説明： 2行目以下にインポートしたい項目を列挙してください。）'
		);
	};
	export const exportPlaces = () => {
		downloadFile('places.json', 'application/json', JSON.stringify(places, null, 2));
	};
	const deleteAll = () => {
		if (confirm('本当にすべての場所を削除しますか？')) {
			fetch('/api/admin/places', {
				method: 'DELETE'
			}).then((res) => {
				if (res.ok) {
					alert('削除しました。');
					location.reload();
				} else {
					alert('削除に失敗しました。');
				}
			});
		}
	};
</script>

<svelte:head>
	<title>場所一覧 - 管理</title>
</svelte:head>

<main class="m-4">
	<ol class="breadcrumb my-3">
		<li class="crumb"><a class="anchor" href="/admin">管理</a></li>
		<li class="crumb-separator" aria-hidden>&rsaquo;</li>
		<li>場所</li>
	</ol>

	<!-- 場所のリスト -->
	<table class="my-table my-6">
		<thead>
			<tr>
				<th>名前</th>
				<th class="w-80 min-w-80">概要</th>
			</tr>
		</thead>
		<tbody>
			{#each places || [] as place}
				<tr
					><td><a href="/admin/places/{place.id}" class="hover:underline">{place.name}</a></td>
					<td>{place.description || ''}</td></tr
				>
			{/each}
		</tbody>
	</table>

	<button on:click={() => showAddPlace(true)} class="inline btn variant-filled">追加</button>
	{#if showAdding}
		<div class="card w-1/2 m-4 p-4">
			<h2 class="text-lg">追加</h2>
			<!-- 名前、場所、概要を記入-->
			<label for="name">名前</label>
			<input type="text" id="name" name="name" class="input" bind:value={add_name} />
			<label for="description">概要</label>
			<input
				type="text"
				id="description"
				name="description"
				class="input"
				bind:value={add_description}
			/>
			<button class="btn variant-filled my-3" on:click={addPlace}>送信</button>
			<button class="btn my-3" on:click={() => showAddPlace(false)}>キャンセル</button><span
				class="text-red-500">{errorMessage}</span
			>
		</div>
	{/if}

	<div>
		<input type="file" hidden accept="text/csv" bind:this={fileInput} on:change={onFileSelect} />

		<button on:click={importPlaces} class="my-3 inline btn variant-filled">インポート</button>
		<a href="" on:click={downloadImportTemplate}>インポート用の雛形</a>
		<br />
		<button on:click={exportPlaces} class="my-3 inline btn variant-filled">エクスポート</button>
		<br />
		<button on:click={deleteAll} class="my-3 inline btn variant-filled-error">すべて削除</button>
	</div>
</main>
