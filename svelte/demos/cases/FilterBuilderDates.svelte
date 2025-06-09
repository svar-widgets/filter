<script>
	import { getData } from "../data";
	import { FilterBuilder, createArrayFilter, getOptionsMap } from "../../src";

	const { fields, data } = getData();

	let value1 = {
		rules: [
			{
				field: "start",
				filter: "greater",
				type: "date",
				value: new Date("2024-10-14"),
			},
		],
	};

	const fields2 = [...fields];
	fields2[4] = {
		id: "start",
		label: "Start Date",
		type: "date",
		format: "%m/%Y",
	};

	const value2 = {
		rules: [
			{
				field: "start",
				filter: "greater",
				type: "date",
				value: new Date("2024-10-1"),
			},
		],
	};

	const fields3 = [...fields];
	fields3[4] = {
		id: "start",
		label: "Start Date (year)",
		type: "number",
		predicate: "year",
	};
	const value3 = {
		rules: [
			{
				field: "start",
				filter: "greater",
				type: "number",
				value: 2024,
			},
		],
	};

	const fields4 = [...fields];
	fields4[4] = {
		id: "start",
		label: "Start Date (month)",
		type: "number",
		predicate: "month",
	};

	const value4 = {
		rules: [
			{
				field: "start",
				filter: "greater",
				type: "number",
				value: 10,
			},
		],
	};

	const value5 = {
		rules: [
			{
				field: "start",
				filter: "between",
				type: "date",
				value: {
					start: new Date("2024-11-01"),
					end: new Date("2025-05-01"),
				},
			},
		],
	};

	function countFilter(v) {
		return createArrayFilter(v)(data).length;
	}
	let c1 = $state(countFilter(value1));
	let c2 = $state(countFilter(value2));
	let c3 = $state(countFilter(value3));
	let c4 = $state(countFilter(value4));
	let c5 = $state(countFilter(value5));
</script>

<div style="padding: 0 20px 20px 20px;">
	<h4>Date filter thats displays a full date</h4>
	<FilterBuilder
		value={value1}
		{fields}
		options={getOptionsMap(data)}
		type={"simple"}
		onchange={({ value }) => (c1 = countFilter(value))}
	/>
	<p>{c1} result(s)</p>

	<h4>Date filter with a formatted date</h4>
	<FilterBuilder
		value={value2}
		fields={fields2}
		options={getOptionsMap(data)}
		type={"simple"}
		onchange={({ value }) => (c2 = countFilter(value))}
	/>
	<p>{c2} result(s)</p>

	<h4>Number filter with "year" predicate</h4>
	<FilterBuilder
		value={value3}
		fields={fields3}
		options={getOptionsMap(data, fields3)}
		type={"simple"}
		onchange={({ value }) => (c3 = countFilter(value))}
	/>
	<p>{c3} result(s)</p>

	<h4>Number filter with "month" predicate</h4>
	<FilterBuilder
		value={value4}
		fields={fields4}
		options={getOptionsMap(data, fields4)}
		type={"simple"}
		onchange={({ value }) => (c4 = countFilter(value))}
	/>
	<p>{c4} result(s)</p>

	<h4>Date filter with "between" condition allows to set a date range</h4>
	<FilterBuilder
		value={value5}
		{fields}
		options={getOptionsMap(data)}
		type={"simple"}
		onchange={({ value }) => (c5 = countFilter(value))}
	/>
	<p>{c5} result(s)</p>
</div>
