<h2>ユーザー一覧</h2>
<table>
	<tbody>
		{#each Object.values(data.users) as user}
			<tr>
				<td>{user.name}</td>
				<td>{user.email}</td>
			</tr>
		{/each}
	</tbody>
</table>
