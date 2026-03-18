<script>
	import { getContext } from "svelte";
	import { getData } from "../data";
	import { FilterQuery, createArrayFilter } from "../../src";

	import List from "../custom/List.svelte";

	const helpers = getContext("wx-helpers");

	const { fields, options, data } = getData();

	// Add tags to options
	const optionsWithTags = {
		...options,
		status: ["urgent", "todo", "review", "done", "blocked"],
	};

	let value = $state("");
	let filteredData = $state(data);

	function handleFilter({ value, error }) {
		if (error) {
			helpers.showNotice({
				text: error.message,
				type: "danger",
			});

			if (error.code !== "NO_DATA") return;
		}

		const filter = createArrayFilter(value, {}, fields);
		filteredData = filter(data);
	}
</script>

<div class="demo">
	<h4 style="margin: 20px 20px 0 20px;">Fitlering by query syntax</h4>
	<div class="natural-input">
		<FilterQuery
			bind:value
			placeholder="e.g., FirstName: Alex or #urgent"
			fields={[...fields]}
			options={optionsWithTags}
			onchange={handleFilter}
		/>
		<p class="hint">Type filter conditions using query syntax. Examples:</p>
		<ul class="examples">
			<li>FirstName: *Alex*</li>
			<li>Age: &gt;30 and Country: USA</li>
			<li>#urgent or #todo</li>
			<li>Type free text to search all fields</li>
		</ul>
	</div>
	<div class="layout">
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
	.natural-input {
		padding: 20px;
	}
	.hint {
		margin: 12px 0 8px 0;
		font-size: var(--wx-font-size);
	}
	.examples {
		margin: 0;
		padding-left: 20px;
		font-size: var(--wx-font-size-sm);
	}
	.examples li {
		margin: 4px 0;
	}
	.layout {
		display: flex;
		flex-direction: row;
		flex-grow: 1;
		min-height: 600px;
	}
	.list {
		flex: 1;
	}
</style>
