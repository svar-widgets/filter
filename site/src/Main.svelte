<script>
	import { FilterBuilder, createArrayFilter } from "wx-svelte-filter";
	import { Grid } from "wx-svelte-grid";
	import { getData } from "./data/index";

	const { value, fields, options, data, columns } = getData();

	let filteredData = $state(data);

	function applyFilter(value) {
		const filter = createArrayFilter(value);
		filteredData = filter(data);
	}

	applyFilter(value);
</script>

<div class="layout">
	<div class="filter">
		<FilterBuilder
			{value}
			{fields}
			{options}
			onchange={({ value }) => applyFilter(value)}
		/>
	</div>
	<div class="grid">
		<Grid data={filteredData} {columns} />
	</div>
</div>

<style>
	.layout {
		height: 100%;
		display: flex;
		flex-direction: row;
		margin-top: 4px;
	}
	.filter {
		width: 340px;
		border-top: var(--wx-table-cell-border);
		padding: 12px 16px 12px 12px;
	}
	.filter :global(.wx-toolbar) {
		padding-bottom: 8px;
	}
	.grid {
		width: calc(100% - 340px);
		max-height: 100%;
	}
	.grid :global(.wx-table-box) {
		border-right: none;
	}
	.grid :global(.wx-grid .wx-row:last-child) {
		border-bottom: var(--wx-table-cell-border);
	}
</style>
