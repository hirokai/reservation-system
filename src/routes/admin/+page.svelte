<script lang="ts">
	import { TabGroup, Tab, TabAnchor } from '@skeletonlabs/skeleton';
	export let data;
	let tabSet: number = 0;
	let links = [
		{
			name: '場所',
			url: '/admin/places'
		},
		{
			name: '装置',
			url: '/admin/equipments'
		},
		{
			name: 'ユーザー',
			url: '/admin/users'
		},
		{
			name: '予約',
			url: '/admin/reservations'
		}
	];
</script>

<svelte:head>
	<title>管理画面</title>
</svelte:head>
<main>
	{#each links as link}
		<a href={link.url}>
			<div
				class="card w-full m-6 h-40 md:w-60 inline-block text-center align-middle hover:bg-green-100"
			>
				<span class="inline-block text-center align-middle font-bold text-xl mt-16"
					>{link.name}</span
				>
			</div>
		</a>
	{/each}
</main>
