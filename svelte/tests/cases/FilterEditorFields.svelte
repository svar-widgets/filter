<script>
	import { FilterEditor } from "../../src";
	import { getData } from "../data";
	import { Willow, Locale } from "@svar-ui/svelte-core";

	const { fields, options } = getData();

	function provideOptions(field) {
		return options[field] || [];
	}
</script>

<Willow>
	<Locale>
		<div style="padding: 20px; width: 360px">
			<FilterEditor {fields} field={"age"} options={provideOptions} />
		</div>
	</Locale>
</Willow>
