<script>
	import { FilterBuilder } from "../../src";
	import { getData } from "../data";
	import { Willow, Locale } from "wx-svelte-core";

	const { value, fields, options } = getData();
</script>

<Willow>
	<Locale>
		<div style="padding: 20px; width: 960px">
			<FilterBuilder {value} {fields} {options} type={"line"} />
		</div>
	</Locale>
</Willow>
