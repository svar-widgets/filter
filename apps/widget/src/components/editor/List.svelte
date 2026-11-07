<script lang="ts">
	import { getContext } from "svelte";
	import { delegateClick } from "@svar-ui/lib-dom";
	import { Portal, Popup } from "@svar-ui/svelte-core";
	import type { TID } from "@svar-ui/lib-state";
	import type { IDataFilter } from "@svar-ui/filter-store";
	import type { IFilterContext } from "../../types";
	import Self from "./List.svelte";

	import Panel from "./Panel.svelte";
	import Rule from "./Rule.svelte";
	import Glue from "./Glue.svelte";

	type Props = {
		group: IDataFilter;
		type: "list" | "line" | "simple";
		onshowmenu?: (ev: { id: TID; ev: MouseEvent }) => void;
	};

	let { group, type, onshowmenu }: Props = $props();

	const api = getContext<IFilterContext>("filter-store");

	const { value, fields, _editor: editor } = api.getReactiveState();

	let filters = $derived($value.getBranch(group.id!) || []);

	let cssType = $derived(type == "simple" ? "line" : type);
	let groupCss = $derived(group.$level == 1 ? "top" : "inner");

	const handlers = {
		dblclick: (id: TID) => api.exec("edit-rule", { id }),
		menu: (id: TID, ev: MouseEvent) => onshowmenu?.({ id, ev }),
		delete: (id: TID) => {
			api.exec("edit-rule", {});
			api.exec("delete-rule", { id });
		},
	};

	const getField = (id?: string) => $fields.find(a => a.id == id)!;

	// line
	let root = $state<HTMLElement>(),
		ruleBox = $state<DOMRect | null>(null),
		ruleEditor = $state<TID | null>(null);
	$effect(() => {
		if ($editor && ruleEditor === $editor.id) return;

		if (
			$editor &&
			type !== "list" &&
			filters.find(a => a.id === $editor.id)
		) {
			const rootNode = root!.querySelector(`[data-id='${$editor.id}']`);
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
		{#if type === "list" && $editor && $editor.id === rule.id}
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
				<Glue mode={group.glue} id={group.id!} />
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
</style>
