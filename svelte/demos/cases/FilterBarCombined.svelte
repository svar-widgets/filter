<script>
	import { getData } from "../data";
	import { FilterBar, createArrayFilter } from "../../src";
	import List from "../custom/List.svelte";

	const { options, data } = getData();

	let filteredData1 = $state(data);
	let filteredData2 = $state(data);

	function applyFilter1(value) {
		const filter = createArrayFilter(value);
		filteredData1 = filter(data);
	}

	function applyFilter2(value) {
		const filter = createArrayFilter(value);
		filteredData2 = filter(data);
	}

	// set initial values
	const value1 = {
		rules: [{ field: "country", filter: "equal", value: "USA" }],
	};

	const value2 = {
		rules: [{ field: "first_name", filter: "contains", value: "A" }],
	};

	applyFilter1(value1);
	applyFilter2(value2);
</script>

<div style="padding: 0 20px 20px 20px;">
	<h4 style="margin: 20px 20px 0 0;">
		Use a single text field to filter by "age", "first_name" and "last_name"
	</h4>
	<FilterBar
		fields={[
			{
				type: "text",
				id: "country",
				label: "Filter by country",
				placeholder: "Select country",
				options: options.country,
				value: "USA",
			},
			{
				type: "all",
				label: "Filter by many fields",
				by: ["age", "first_name", "last_name"],
			},
		]}
		onchange={({ value }) => applyFilter1(value)}
	/>
	<List data={filteredData1} />
	<h4 style="margin: 20px 20px 0 0;">
		Select a field ("first_name", "last_name", "country", "start") for
		filtering
	</h4>
	<FilterBar
		fields={[
			{
				type: "number",
				id: "age",
				filter: "greater",
				options: options.age,
				placeholder: "Older than.. ",
				label: "Age",
			},
			{
				type: "dynamic",
				label: "Select a field to filter",
				by: [
					{
						id: "first_name",
						type: "text",
						filter: "contains",
						value: "A",
						placeholder: "Enter first name",
					},
					"last_name",
					{
						type: "text",
						id: "country",
						options: options.country,
						value: "USA",
					},
					{
						type: "date",
						filter: "greater",
						id: "start",
						value: new Date("2025-01-01"),
					},
				],
			},
		]}
		onchange={({ value }) => applyFilter2(value)}
	/>
	<List data={filteredData2} />
</div>
