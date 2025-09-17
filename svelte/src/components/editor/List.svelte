<script>
	import { getContext } from "svelte";
	import { delegateClick } from "@svar-ui/lib-dom";
	import { Portal, Popup } from "@svar-ui/svelte-core";
	import Self from "./List.svelte";

	import Panel from "./Panel.svelte";
	import Rule from "./Rule.svelte";
	import Glue from "./Glue.svelte";

	let { group, type, onshowmenu } = $props();

	const api = getContext("filter-store");

	const { value, fields, _editor: editor } = api.getReactiveState();

	let filters = $derived($value.getBranch(group.id) || []);

	let cssType = $derived(type == "simple" ? "line" : type);
	let groupCss = $derived(group.$level == 1 ? "top" : "inner");

	const handlers = {
		dblclick: id => api.exec("edit-rule", { id }),
		menu: (id, ev) => onshowmenu && onshowmenu({ id, ev }),
		delete: id => {
			api.exec("edit-rule", {});
			api.exec("delete-rule", { id });
		},
	};

	const getField = id => $fields.find(a => a.id == id);

	// line
	let root = $state(),
		ruleBox = $state(),
		ruleEditor = $state();
	$effect(() => {
		if ($editor && ruleEditor === $editor.id) return;

		if (
			$editor &&
			type !== "list" &&
			filters.find(a => a.id === $editor.id)
		) {
			const rootNode = root.querySelector(`[data-id='${$editor.id}']`);
			if (rootNode) {
				ruleBox = rootNode.getBoundingClientRect();
				ruleEditor = $editor.id;
				return;
			}
		}
		ruleBox = ruleEditor = null;
	});

	function cancel() {
		ruleBox = ruleEditor = null;
		api.exec("edit-rule", {});
	}
</script>

<div
	bind:this={root}
	class="wx-group wx-{groupCss} wx-{cssType}"
	use:delegateClick={handlers}
>
	{#each filters as rule, i (rule.id)}
		{#if type === "list" && $editor && $editor.id == rule.id}
			<Panel {rule} />
		{:else if rule.data}
			<Self {type} group={rule} {onshowmenu} />
		{:else}
			<div class="wx-rule-wrapper">
				<Rule
					action={type == "simple" ? "delete" : "menu"}
					type={cssType}
					filter={rule}
					field={getField(rule.field)}
				/>
			</div>
		{/if}

		{#if type !== "simple" && i < filters.length - 1}
			<div class="wx-glue-wrapper">
				<Glue mode={group.glue} id={group.id} />
			</div>
		{/if}
	{/each}
</div>

{#if $editor && ruleBox}
	<Portal>
		<Popup
			top={ruleBox.top + ruleBox.height}
			left={ruleBox.left + ruleBox.width / 2}
			oncancel={cancel}
		>
			<div class="wx-editor-wrapper">
				<Panel {type} rule={$value.byId($editor.id)} />
			</div>
		</Popup>
	</Portal>
{/if}

<style>
	.wx-group.wx-inner.wx-list {
		margin-left: 20px;
		padding: 4px 0 0 8px;
		border-left: var(--wx-border);
	}

	/* line */
	.wx-group.wx-inner.wx-line:before,
	.wx-group.wx-inner.wx-line:after {
		content: "(";
		margin: 0 2px 0 -4px;
		display: inline-flex;
		justify-content: center;
		align-items: center;
		transform: scaleX(0.75);
		font-size: 30px;
		position: relative;
		top: -2px;
	}
	.wx-group.wx-inner.wx-line:after {
		content: ")";
		margin: 0 -4px 0 2px;
	}
	.wx-group.wx-line {
		display: flex;
		gap: 10px;
		padding: 4px;
	}

	.wx-line .wx-rule-wrapper,
	.wx-line .wx-glue-wrapper {
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	.wx-editor-wrapper {
		padding: 0 10px;
		min-width: 280px;
		max-width: 320px;
	}
	/*date picker within filter*/
	:global(.wx-popup):has(.wx-editor-wrapper) {
		overflow: visible !important;
		position: absolute !important;
	}
</style>
