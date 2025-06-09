<script>
	let { data = [] } = $props();
</script>

<div class="block">
	{#each data as row}
		<div class="row">
			<h3>{row.first_name} {row.last_name}</h3>
			<p>Age: {row.age}</p>
		</div>
	{/each}
</div>

<style>
	.block {
		margin: 20px;
	}
	.row {
		color: #999;
	}
	.row h3 {
		font-size: 20px;
		margin-bottom: 0px;
	}
	.row p {
		margin-top: 0px;
	}
</style>
