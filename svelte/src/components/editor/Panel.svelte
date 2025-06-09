<script>
	import { getContext } from "svelte";
	import FilterEditor from "./FilterEditor.svelte";

	let { rule, type } = $props();

	const includes =
		rule.includes && rule.includes.length ? rule.includes : null;
	const filter = rule.filter || "contains";
	const value = rule.value || "";
	const field = rule.field;
	const id = rule.id;

	const api = getContext("filter-store");

	const { fields, options } = api.getReactiveState();

	function doApply({ value }) {
		api.exec("update-rule", { id, rule: value });
		doCancel();
	}

	function doCancel() {
		api.exec("edit-rule", {});
	}

	function doChange({ value }) {
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
