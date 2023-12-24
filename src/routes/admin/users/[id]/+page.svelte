<script lang="ts">
	import type PageServerData from './$types';
	import type PageData from './$types';
	export let data;
</script>

<div>
	<a href="/admin" class="breadcrumb">管理画面</a>&nbsp;&gt;<a
		href="/admin/users"
		class="breadcrumb">ユーザー一覧</a
	>
</div>
<h2>ユーザー: {data.user.id}</h2>
名前: {data.user.name}<br />
Email: {data.user.email}<br />
<h2>使用履歴</h2>
<table>
	<thead>
		<tr>
			<th>名前</th>
			<th>Email</th>
		</tr>
	</thead>
	<tbody>
		{#each Object.values(data.users) as user}
			<tr>
				<td>{user.name}</td>
				<td>{user.email.slice(0, 3) + '...'}</td>
			</tr>
		{/each}
	</tbody>
</table>

<style>
	.breadcrumb {
		@apply hover:underline;
	}
</style>
