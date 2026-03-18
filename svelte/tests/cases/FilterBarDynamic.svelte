<script>
	import { FilterBar, createArrayFilter } from "../../src";
	import { getData } from "../data";
	import { Willow, Locale } from "@svar-ui/svelte-core";

	const { data, options } = getData();

	const value = {
		rules: [{ field: "first_name", filter: "contains", value: "A" }],
	};

	function countFilter(v) {
		return createArrayFilter(v)(data).length;
	}
	let c = $state(countFilter(value));
</script>

<Willow>
	<Locale>
		<div style="padding: 20px; width: 960px">
			<FilterBar
				fields={[
					{
						type: "dynamic",
						label: "Select a field",
						placeholder: "Common placeholder",
						by: [
							{
								id: "first_name",
								type: "text",
								filter: "contains",
								value: "A",
								label: "Label for first name",
								placeholder: "Enter text",
							},
							"last_name",
							{
								type: "number",
								id: "age",
								filter: "greater",
								placeholder: "Enter number",
							},
							{
								type: "text",
								id: "country",
								options: options.country,
								value: "USA",
								label: "Label for country",
							},
							{
								type: "date",
								filter: "greater",
								id: "start",
								value: new Date("2025-01-01"),
							},
						],
					},
				]}
				onchange={({ value }) => (c = countFilter(value))}
			/>
			<h3>Filtering results:</h3>
			<p class="wx-result">{c}</p>
		</div>
	</Locale>
</Willow>
