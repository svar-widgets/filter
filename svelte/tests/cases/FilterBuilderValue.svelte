<script>
	import { FilterBuilder, createArrayFilter } from "../../src";
	import { getData } from "../data";
	import { Willow, Locale } from "wx-svelte-core";

	const { value, fields, options, data } = getData();

	function countFilter(v) {
		return createArrayFilter(v)(data).length;
	}
	let c = $state(countFilter(value));
</script>

<Willow>
	<Locale>
		<div style="padding: 20px; width: 360px">
			<FilterBuilder
				{value}
				{fields}
				{options}
				onchange={({ value }) => (c = countFilter(value))}
			/>
			<h3>Filtering results:</h3>
			<p class="wx-result">{c}</p>
		</div>
	</Locale>
</Willow>
