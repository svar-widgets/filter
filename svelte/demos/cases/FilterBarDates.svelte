<script>
	import { getData } from "../data";
	import { FilterBar, createArrayFilter } from "../../src";

	const { data } = getData();

	const value = {
		rules: [
			{
				field: "start",
				type: "date",
				filter: "greater",
				value: new Date("2025-01-01"),
			},
			{
				field: "end",
				type: "date",
				filter: "less",
				value: new Date("2025-05-01"),
			},
		],
	};

	function countFilter(v) {
		return createArrayFilter(v)(data).length;
	}
	let c1 = $state(countFilter(value));
	let c2 = $state(countFilter());
</script>

<div style="padding: 0 20px 20px 20px;">
	<h4 style="margin: 20px 20px 0 0;">Filter by date type</h4>
	<FilterBar
		fields={[
			"last_name",
			{
				type: "date",
				id: "start",
				filter: "greater",
				value: new Date("2025-01-01"),
			},
			{
				type: "date",
				filter: "less",
				id: "end",
				value: new Date("2025-05-01"),
			},
		]}
		onchange={({ value }) => (c1 = countFilter(value))}
	/>
	<p>{c1} result(s)</p>

	<h4 style="margin: 20px 20px 0 0;">
		Filter by range dates with "between" condition
	</h4>
	<FilterBar
		fields={[
			"last_name",
			{
				type: "date",
				id: "start",
				filter: "between",
			},
		]}
		onchange={({ value }) => (c2 = countFilter(value))}
	/>
	<p>{c2} result(s)</p>
</div>
