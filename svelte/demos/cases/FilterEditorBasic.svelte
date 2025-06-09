<script>
	import { getData } from "../data";
	import { Field } from "wx-svelte-core";
	import { FilterEditor } from "../../src";

	const { values, options } = getData();
</script>

<div class="area">
	<Field label="Text filter (empty)">
		<FilterEditor options={options.first_name} type="text" />
	</Field>
	<Field label="Text filter">
		<FilterEditor {...values[0]} options={options.first_name} type="text" />
	</Field>

	<Field label="Number filter (empty)">
		<FilterEditor options={options.age} type="number" />
	</Field>
	<Field label="Number filter">
		<FilterEditor {...values[1]} options={options.age} type="number" />
	</Field>

	<Field label="Date filter (empty)">
		<FilterEditor options={options.start} type="date" />
	</Field>
	<Field label="Date filter">
		<FilterEditor {...values[2]} options={options.start} type="date" />
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
