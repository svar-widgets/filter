<script>
	import { getData } from "../data";
	import List from "../custom/List.svelte";
	import { FilterBuilder, createArrayFilter } from "../../src";

	const { value, fields, options, data } = $state(getData());

	let filteredData = $state(data);

	function applyFilter(value) {
		const filter = createArrayFilter(value);
		filteredData = filter(data);
	}
	// apply initial filter state
	applyFilter(value);
</script>

<div class="demo">
	<h4 style="margin: 20px 20px 0 20px;">
		Double-click any line to edit filtering conditions
	</h4>
	<div class="layout">
		<div class="filter">
			<FilterBuilder
				{value}
				{fields}
				{options}
				onchange={({ value }) => applyFilter(value)}
			/>
		</div>
		<div class="list">
			<List data={filteredData} />
		</div>
	</div>
</div>

<style>
	.demo {
		height: 100vh;
		display: flex;
		flex-direction: column;
	}
	.layout {
		display: flex;
		flex-direction: row;
		flex-grow: 1;
		min-height: 600px;
	}
	.filter {
		padding: 20px;
		min-width: 420px;
		flex: 0;
	}
	.list {
		flex: 1;
	}
</style>
