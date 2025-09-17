<script>
	import { getData } from "../data";
	import { FilterEditor, getOptions } from "../../src";
	import { en } from "@svar-ui/core-locales";

	const { data } = getData();

	let textValue = $state();

	// getting the month numbers of the "start" dates
	const options = getOptions(data, "start", {
		predicate: "month",
		sort: (a, b) => a - b,
	});
	// a converter for month names ( the "format" attribute )
	const numberToMonth = v => en.calendar.monthFull[v];

	const updateTextValue = ({ rule }) =>
		(textValue = JSON.stringify(rule, null, 2));
</script>

<h4 style="margin: 20px 20px 0 20px;">
	Tuple numeric filter with formatted options
</h4>
<div class="area">
	<div class="box">
		<FilterEditor
			field="start"
			{options}
			format={numberToMonth}
			filter="greater"
			type="tuple"
			onapply={updateTextValue}
		/>
	</div>
	<div class="log">
		<pre>{textValue || ""}</pre>
	</div>
</div>

<style>
	.area {
		margin: 20px;
	}

	.box {
		max-width: 320px;
		border: 1px solid silver;
		padding: 10px;
		margin-bottom: 20px;
	}
</style>
