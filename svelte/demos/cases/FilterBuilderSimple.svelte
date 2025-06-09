<script>
	import { getData } from "../data";
	import List from "../custom/List.svelte";
	import { FilterBuilder, createArrayFilter } from "../../src";

	const { simpleValue: value, fields, options, data } = getData();

	let filteredData = $state(data);

	function applyFilter(value) {
		const filter = createArrayFilter(value);
		filteredData = filter(data);
	}
	// apply initial filter state
	applyFilter(value);
</script>

<h4 style="margin: 20px 20px 0 20px;">
	Double-click any element to edit filtering conditions
</h4>
<div style="padding: 0 20px;">
	<FilterBuilder
		{value}
		{fields}
		{options}
		type={"simple"}
		onchange={({ value }) => applyFilter(value)}
	/>
	<List data={filteredData} />
</div>
