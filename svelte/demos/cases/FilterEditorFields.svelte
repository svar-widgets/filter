<script>
	import { getData } from "../data";
	import { Field } from "wx-svelte-core";
	import { FilterEditor } from "../../src";

	const { options, fields } = getData();

	function provideOptions(field) {
		return options[field] || [];
	}

	function debug({ value }) {
		console.log(value);
	}
</script>

<h4 style="margin: 20px 20px 0 20px;">
	Multiple fields within a single filter
</h4>
<div class="area">
	<Field label="Select a field:">
		<FilterEditor
			{fields}
			field="age"
			options={provideOptions}
			onapply={debug}
			onchange={debug}
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
