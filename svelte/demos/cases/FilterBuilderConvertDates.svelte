<script>
	import { getData } from "../data";
	import { FilterBuilder } from "../../src";

	const { fields, options } = getData();

	// Initial value with date strings
	const initialValue = {
		glue: "or",
		rules: [
			{
				field: "start",
				filter: "greater",
				value: "2024-11-01",
			},
			{
				field: "end",
				filter: "less",
				value: "2025-05-01",
			},
		],
	};

	// Conver dates before passing to FilterBuilder
	let value = $state(convertDates(initialValue, prepareDateValue));

	let filterValue = $state("");

	function init(api) {
		api.on("change", ({ value }) => {
			const v = convertDates(value, prepareStringValue);
			filterValue = JSON.stringify(v, null, 2);
		});
	}

	function convertDates(value, cb) {
		if (!value?.rules) return value;

		return {
			...value,
			rules: value.rules.map(rule => {
				if (rule.rules) return convertDates(rule, cb);

				if (rule.field) {
					let type = rule.type;
					if (!type)
						type = fields.find(f => f.id === rule.field).type;

					if (type === "date" && rule.value)
						return {
							...rule,
							value: cb(rule.value),
						};

					return rule;
				}
			}),
		};
	}

	function prepareDateValue(value) {
		if (typeof value === "object") {
			const { start, end } = value;
			return {
				start: new Date(start),
				end: new Date(end),
			};
		} else return new Date(value);
	}

	function prepareStringValue(value) {
		if (value instanceof Date) return value.toISOString();
		if (typeof value === "object") {
			const { start, end } = value;
			return {
				start: start.toISOString(),
				end: end.toISOString(),
			};
		}
	}
</script>

<div class="demo">
	<h4 style="margin: 20px 20px 0 20px;">
		Convert date strings to date objects before passing to FilterBuilder and
		back after changes
	</h4>
	<div class="layout">
		<div class="filter">
			<FilterBuilder {value} {fields} {options} {init} />
		</div>
		<div class="filter-value">
			{#if filterValue}
				<pre>{filterValue}</pre>
			{/if}
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
		min-width: 360px;
		flex: 0;
	}

	.filter-value {
		flex: 1;
		overflow-x: auto;
		padding: 20px;
	}
	pre {
		border: var(--wx-border);
		border-radius: 6px;
		padding: 10px;
		margin: 0;
	}
</style>
