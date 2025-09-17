<script>
	import { FilterBuilder } from "../../src";
	import { getData } from "../data";
	import { Willow, Locale } from "@svar-ui/svelte-core";

	const { fields, options } = getData();
</script>

<Willow>
	<Locale>
		<div style="padding: 20px; width: 960px">
			<FilterBuilder {fields} {options} type={"simple"} />
		</div>
	</Locale>
</Willow>
