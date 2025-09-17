<script>
	import { getData } from "../data";
	import { Grid, Willow, WillowDark } from "wx-svelte-grid";
	import { FilterBuilder } from "../../src";

	const { backendFields: fields, backendValue: value, columns } = getData();
	const server =
		"https://master--svar-query-go--dev.webix.io/api/data/persons";

	let data = $state([]);

	loadFilteredData(value);

	async function loadFilteredData(value) {
		const response = await fetch(`${server}`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(value),
		});

		data = await response.json();
	}

	async function provideOptions(fieldId) {
		const response = await fetch(`${server}/${fieldId}/suggest`);
		let options = await response.json();

		// Convert strings to Date objects for date fields
		const field = fields.find(f => f.id === fieldId);
		if (field.type === "date") {
			options = options.map(value => new Date(value));
		}

		return options;
	}
</script>

<div class="demo">
	<h4 style="margin: 20px 20px 0 20px;">
		Filtering server-side data with the rules created by FilterBuilder on
		the client-side
	</h4>
	<div class="layout">
		<div class="filter">
			<FilterBuilder
				{fields}
				{value}
				options={provideOptions}
				onchange={({ value }) => loadFilteredData(value)}
			/>
		</div>
		<div class="grid">
			<Willow />
			<WillowDark />
			<Grid {data} {columns} />
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
		flex-grow: 1;
		min-height: 600px;
		padding: 20px;
		gap: 20px;
	}
	.filter {
		width: 320px;
	}
	.grid {
		width: calc(100% - 340px);
		max-height: 100%;
	}
</style>
