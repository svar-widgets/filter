<script lang="ts">
	import { getData } from "../data";
	import {
		FilterBar,
		createArrayFilter,
		type IFilterSet,
	} from "@svar-ui/svelte-filter";
	import List from "../custom/List.svelte";

	const { options, data } = getData();
	let filteredData = $state(data);

	function applyFilter(value: IFilterSet) {
		const filter = createArrayFilter(value);
		filteredData = filter(data);
	}

	// set initial value
	const value: IFilterSet = {
		rules: [{ field: "country", filter: "equal", value: "USA" }],
	};

	applyFilter(value);
</script>

<h4 style="margin: 20px 20px 0 20px;">
	Fill in the inputs to edit filtering conditions
</h4>
<div style="padding: 0 20px;">
	<FilterBar
		fields={[
			"last_name",
			{
				type: "number",
				id: "age",
			},
			{
				type: "text",
				id: "country",
				options: options.country,
				value: "USA",
			},
		]}
		onchange={({ value }) => applyFilter(value)}
	/>
	<List data={filteredData} />
</div>
