<script lang="ts">
	import { getData } from "../data";
	import {
		FilterBuilder,
		type IApi,
		type IFilter,
		type IFilterSet,
	} from "@svar-ui/svelte-filter";

	type TDateValue = Date | { start: Date; end: Date };
	type TStringValue = string | { start: string; end: string };

	const { fields, options } = getData();

	// Initial value with date strings
	const initialValue: IFilterSet = {
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

	function init(api: IApi) {
		api.on("change", ({ value }) => {
			const v = convertDates(value, prepareStringValue);
			filterValue = JSON.stringify(v, null, 2);
		});
	}

	function convertDates(
		value: IFilterSet,
		cb: (value: any) => any
	): IFilterSet {
		if (!value?.rules) return value;

		return {
			...value,
			rules: value.rules.map(r => {
				if ((r as IFilterSet).rules)
					return convertDates(r as IFilterSet, cb);

				const rule = r as IFilter;
				if (rule.field) {
					let type = rule.type;
					if (!type)
						type = fields.find(f => f.id === rule.field)!.type;

					if (type === "date" && rule.value)
						return {
							...rule,
							value: cb(rule.value),
						};

					return rule;
				}
			}) as IFilterSet["rules"],
		};
	}

	function prepareDateValue(value: TStringValue): TDateValue {
		if (typeof value === "object") {
			const { start, end } = value;
			return {
				start: new Date(start),
				end: new Date(end),
			};
		} else return new Date(value);
	}

	function prepareStringValue(value: TDateValue): TStringValue | undefined {
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
