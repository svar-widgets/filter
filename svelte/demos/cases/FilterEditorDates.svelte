<script>
	import { getData } from "../data";
	import { Field } from "wx-svelte-core";
	import { FilterEditor, getOptions } from "../../src";

	const { data } = getData();
</script>

<div class="area">
	<Field label="Date filter with a formatted date">
		<FilterEditor
			field="start"
			options={getOptions(data, "start")}
			type="date"
			filter="greater"
			value={new Date("2024-10-1")}
			format="%m/%Y"
		/>
	</Field>
	<Field label="Number filter with 'month' predicate">
		<FilterEditor
			field="start"
			options={getOptions(data, "start", { predicate: "month" })}
			type="number"
			filter="less"
			value="10"
			predicate="month"
		/>
	</Field>

	<Field label="Number filter with 'year' predicate">
		<FilterEditor
			field="start"
			options={getOptions(data, "start", { predicate: "year" })}
			type="number"
			filter="greater"
			value="2024"
			predicate="year"
		/>
	</Field>
	<Field label="Date filter with 'between' condition">
		<FilterEditor
			field="start"
			options={getOptions(data, "start")}
			filter="between"
			type="date"
			value={{
				start: new Date("2024-11-01"),
				end: new Date("2025-05-01"),
			}}
		/>
	</Field>
</div>

<style>
	.area {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
	}
	.area > :global(*) {
		flex: 0 0 320px;
		margin: 20px;
		padding: 10px 10px 0 10px;
		border: 1px solid silver;
	}
</style>
