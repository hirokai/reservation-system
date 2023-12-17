<!-- YOU CAN DELETE EVERYTHING IN THIS PAGE -->
<script lang="ts">
	import { TabGroup, Tab, TabAnchor } from '@skeletonlabs/skeleton';
	let tabSet: number = 0;
</script>

<svelte:head>
	<title>装置予約システム</title>
</svelte:head>

<div class="container h-full mx-auto flex justify-center items-center">
	<TabGroup>
		<Tab bind:group={tabSet} name="tab1" value={0}>
			<span>一覧表示</span>
		</Tab>
		<Tab bind:group={tabSet} name="tab2" value={1}>カレンダー表示</Tab>
		<!-- Tab Panels --->
		<svelte:fragment slot="panel">
			{#if tabSet === 0}
				(tab panel 1 contents)
			{:else if tabSet === 1}
				(tab panel 2 contents)
			{/if}
		</svelte:fragment>
	</TabGroup>
</div>
