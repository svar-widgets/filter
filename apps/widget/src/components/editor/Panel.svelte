<script lang="ts">
	import { getContext } from "svelte";
	import type { IDataFilter, IFilter } from "@svar-ui/filter-store";
	import type { IFilterContext } from "../../types";
	import FilterEditor from "./FilterEditor.svelte";

	type Props = {
		rule: IDataFilter;
		type?: "list" | "line" | "simple";
	};

	let { rule, type }: Props = $props();

	// the editor starts from the rule as it was when the panel opened
	// svelte-ignore state_referenced_locally
	const includes =
			rule.includes && rule.includes.length ? rule.includes : null,
		filter = rule.filter || "contains",
		value = rule.value || "",
		field = rule.field,
		id = rule.id!;

	const api = getContext<IFilterContext>("filter-store");

	const { fields, options } = api.getReactiveState();

	function doApply({ value }: { value: IFilter }) {
		api.exec("update-rule", { id, rule: value });
		doCancel();
	}

	function doCancel() {
		api.exec("edit-rule", {});
	}

	function doChange({ value }: { value: IFilter }) {
		api.exec("change-rule", { id, rule: value });
	}
</script>

<div class="wx-panel">
	<FilterEditor
		fieldsSelector={type !== "simple"}
		fields={$fields}
		{field}
		options={$options}
		{includes}
		{filter}
		{value}
		onapply={doApply}
		oncancel={doCancel}
		onchange={doChange}
	/>
</div>

<style>
	.wx-panel {
		padding-top: 15px;
	}
</style>
