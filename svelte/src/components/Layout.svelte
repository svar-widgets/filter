<script>
	import { getContext } from "svelte";

	import { Button } from "@svar-ui/svelte-core";
	import { DropDownMenu, ContextMenu } from "@svar-ui/svelte-menu";
	import List from "./editor/List.svelte";

	let { type } = $props();

	const api = getContext("filter-store");
	const _ = getContext("wx-i18n").getGroup("filter");

	const { value, fields } = api.getReactiveState();

	let group = $derived($value.getBranch(0)[0]);

	function addFilter(data) {
		api.exec("add-rule", { rule: { $temp: true, ...data }, edit: true });
	}

	let newFilterOptions = $derived.by(() => {
		const now = {};
		$value.forEach(x => (now[x.field] = true));
		return $fields
			.filter(c => !now[c.id])
			.map(o => ({ id: o.id, text: o.label }));
	});

	function selectNewFilter(ev) {
		const action = ev.action;
		if (action) {
			addFilter({ field: action.id });
		}
	}

	let menuOptions = [
		{
			id: "edit-rule",
			text: _("Edit"),
			icon: "wxi-edit-outline",
		},
		{
			id: "add-rule",
			text: _("Add filter"),
			icon: "wxi-filter-plus-outline",
			resolver: item => ({
				after: item,
				rule: { $temp: true },
				edit: true,
			}),
		},
		{
			id: "add-group",
			text: _("Add group"),
			icon: "wxi-filter-multiple-outline",
			resolver: item => ({
				after: item,
				rule: { $temp: true },
				edit: true,
			}),
		},
		{ type: "separator" },
		{
			id: "delete-rule",
			text: _("Delete"),
			icon: "wxi-delete-outline",
		},
	];

	let menu = $state();

	const menuAction = ev => {
		const { context: item, action } = ev;
		if (action) {
			const data = action.resolver ? action.resolver(item) : { id: item };
			api.exec(action.id, data);
		}
	};

	const onshowmenu = ({ ev, id }) => {
		menu.show(ev, id);
	};
</script>

<div class="wx-filter-builder wx-{type}">
	{#if type === "list"}
		<div class="wx-toolbar wx-{type}">
			<Button type={"primary"} onclick={addFilter}>
				{_("Add filter")}
			</Button>
		</div>
		<List {type} {group} {onshowmenu} />
	{:else if type === "line"}
		<div class="wx-toolbar wx-{type}">
			<div class="wx-filters">
				<List {type} {group} {onshowmenu} />
			</div>

			<div class="wx-button">
				<Button type={"primary"} onclick={addFilter}>
					{_("Add filter")}
				</Button>
			</div>
		</div>
	{:else if type === "simple"}
		<div class="wx-toolbar wx-{type}">
			<div class="wx-button">
				<DropDownMenu
					options={newFilterOptions}
					onclick={selectNewFilter}
				>
					<Button disabled={!newFilterOptions.length} type={"primary"}
						>{_("Add filter")}</Button
					>
				</DropDownMenu>
			</div>

			<div class="wx-filters">
				<List {type} {group} {onshowmenu} />
			</div>
		</div>
	{/if}
</div>
{#if type !== "simple"}
	<ContextMenu options={menuOptions} onclick={menuAction} bind:this={menu} />
{/if}

<style>
	.wx-filter-builder {
		background-color: var(--wx-background);
	}
	.wx-filter-builder.wx-list {
		padding: 0;
		max-width: 470px;
	}

	/* line */
	.wx-button {
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	.wx-toolbar.wx-line,
	.wx-toolbar.wx-simple {
		display: flex;
		flex-direction: row;
		gap: 20px;
		height: 67px;
	}

	.wx-toolbar.wx-line {
		justify-content: space-between;
	}

	.wx-filters {
		overflow-x: auto;
		display: flex;
	}
</style>
