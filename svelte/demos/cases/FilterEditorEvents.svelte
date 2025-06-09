<script>
	import { getData } from "../data";
	import { Button } from "wx-svelte-core";
	import { FilterEditor } from "../../src";

	const { options } = getData();

	let ruleValue = $state({});
	let textValue = $state();
	let counter = $state(0);

	function setValue(rule) {
		ruleValue = rule;
		textValue = JSON.stringify(ruleValue, null, 2);
	}

	const updateTextValue = ev => {
		counter++;
		const newValue = ev.value;
		textValue = JSON.stringify(newValue, null, 2);
	};
</script>

<h4 style="margin: 20px 20px 0 20px;">Set any value and track its changes</h4>
<div class="area">
	<div class="toolbar">
		<Button
			onclick={() =>
				setValue({
					filter: "beginsWith",
					value: "A",
					includes: ["Alex"],
				})}
		>
			Value 1
		</Button>
		<Button onclick={() => setValue({ filter: "beginsWith", value: "B" })}>
			Value 2
		</Button>
		<Button onclick={() => setValue({ includes: ["Agata"] })}
			>Value 3</Button
		>
		<Button onclick={() => setValue({})}>Reset</Button>
	</div>

	<div class="box">
		<FilterEditor
			buttons={false}
			options={options.first_name}
			type="text"
			onchange={updateTextValue}
			includes={ruleValue.includes}
			filter={ruleValue.filter}
			value={ruleValue.value}
		/>
	</div>
	<div class="log">
		{counter}
		updates
		<pre>{textValue || ""}</pre>
	</div>
</div>

<style>
	.toolbar {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		gap: 10px;
		margin-bottom: 10px;
	}
	.area {
		margin: 20px;
	}

	.box {
		max-width: 352px;
		border: 1px solid silver;
		padding: 10px;
	}
</style>
