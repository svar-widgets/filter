<script>
	import { getData } from "../data";
	import { FilterBuilder } from "../../src";
	import { Button } from "@svar-ui/svelte-core";

	const { value, fields, options } = getData();

	let api = $state();
	function noEditLogic(api) {
		api.intercept("add-rule", ev => {
			ev.edit = false;
		});
		api.intercept("add-group", ev => {
			ev.edit = false;
		});
		api.on("change", () => {
			filterValue = "";
		});
	}

	let filterValue = $state("");

	function showValue() {
		const value = api.getValue();
		filterValue = JSON.stringify(value, null, 2);
	}
</script>

<h4 style="margin: 20px 20px 0 20px;">
	Click "Add filter" to add a rule. Double-click the rule to edit it
</h4>
<div class="toolbar">
	<Button type={"secondary"} onclick={showValue}>Show value</Button>
</div>
<div class="main">
	<div class="filter">
		<FilterBuilder
			bind:this={api}
			{value}
			{fields}
			{options}
			init={noEditLogic}
		/>
	</div>
	<div class="filter-value">
		{#if filterValue}
			<pre>{filterValue}</pre>
		{/if}
	</div>
</div>

<style>
	.toolbar {
		display: flex;
		justify-content: flex-start;
		padding: 20px 10px 0px 20px;
	}
	.main {
		display: flex;
	}
	.filter {
		padding: 20px;
		min-width: 420px;
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
