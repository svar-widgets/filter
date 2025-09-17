<script>
	import { FilterBuilder } from "../../src";
	import { getData } from "../data";
	import { Willow, Locale } from "@svar-ui/svelte-core";

	const { fields, options } = getData();
</script>

<Willow>
	<Locale>
		<div style="padding: 20px; width: 360px">
			<FilterBuilder {fields} {options} />
		</div>
	</Locale>
</Willow>
