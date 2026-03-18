<script>
	import { getContext } from "svelte";
	import { getData } from "../data";
	import { FilterQuery, createArrayFilter, getQueryString } from "../../src";

	import List from "../custom/List.svelte";

	const helpers = getContext("wx-helpers");

	const { fields, options, data } = getData();
	let textValue = $state("start: 2024");

	let filteredData = $state(data);

	async function handleFilter({
		value,
		error,
		text,
		startProgress,
		endProgress,
	}) {
		if (text) {
			error = null;
			try {
				startProgress();
				value = await text2filter(text, fields);
				textValue = value ? getQueryString(value).query : "";
			} catch (e) {
				error = e;
			} finally {
				endProgress();
			}
		}

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

	const url =
		"https://master--svar-filter-natural-text--dev.webix.io/text-to-json";
	async function text2filter(text, fields) {
		const response = await fetch(url, {
			method: "POST",
			body: JSON.stringify({ text, fields }),
		});
		const json = await response.json();
		if (!response.ok) {
			helpers.showNotice({
				text: json.error || "Request failed",
				type: "danger",
			});
			return null;
		}
		return json;
	}
</script>

<div class="demo">
	<h4 style="margin: 20px 20px 0 20px;">
		Filtering by query syntax or by text prompt
	</h4>
	<div class="natural-input">
		<FilterQuery
			value={textValue}
			placeholder="e.g., FirstName: contains Alex and Age: >30"
			{fields}
			{options}
			onchange={handleFilter}
		/>
		<p class="hint">Type filter conditions using query syntax. Examples:</p>
		<ul class="examples">
			<li>FirstName: *Alex*</li>
			<li>Age: &gt;30 and Country: USA</li>
			<li>StartDate: 2024-01-01 .. 2025-12-31</li>
			<li>FirstName: John, Jane, Alex</li>
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
		font-size: 14px;
	}
	.examples {
		margin: 0;
		padding-left: 20px;
		font-size: 13px;
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
