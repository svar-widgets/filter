<script>
	import { getFilter } from "wx-filter-store";
	import { dateToString } from "wx-lib-dom";
	import { getContext } from "svelte";

	let { filter, field, type = "list", action = "menu" } = $props();

	const noChange = v => v;
	const locale = getContext("wx-i18n");
	const l = locale.getRaw();
	const f = field?.format || l.filter?.dateFormat || l.formats.dateFormat;

	let _format = $derived(
		typeof f === "function"
			? f
			: field.type === "date"
				? dateToString(f, l.calendar)
				: noChange
	);

	const _ = locale.getGroup("filter");

	let rule = $state(),
		filterValue = $state();
	$effect(() => {
		filterValue = filter.value;
		rule = filter.filter ? getFilter(filter.filter, filter.type) : null;
	});
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div class="wx-rule wx-{type}" data-id={filter.id}>
	<span class="wx-filter">
		<span class="wx-field">{field.label}</span>
		{#if filter.includes && filter.includes.length}
			{_("in")}
			{#each filter.includes as value, i (value)}
				<span class="wx-value">{_format(value)}</span>
				{#if i < filter.includes.length - 1}
					,&nbsp;
				{/if}
			{/each}
		{:else if filter.filter && (filterValue || filterValue === 0)}
			{_(rule.short || rule.label) || rule.id}
			{#if field.type === "date"}
				{#if filterValue.start}
					<span class="wx-value">{_format(filterValue.start)}</span>
					{_("and")}
					<span class="wx-value">{_format(filterValue.end)}</span>
				{:else}<span class="wx-value">{_format(filterValue)}</span>{/if}
			{:else}<span class="wx-value">{_format(filterValue)}</span>{/if}
		{/if}
	</span>
	<i
		class="wxi-{action === 'menu' ? 'dots-v' : action} wx-menu-icon"
		role="button"
		data-action={action}
	></i>
</div>

<style>
	.wx-rule {
		background: var(--wx-background-alt);
		border-radius: var(--wx-border-radius);
		white-space: nowrap;
		position: relative;
		display: flex;
		align-items: center;
	}

	.wx-rule.wx-list {
		padding: 12px 8px;
		margin: 10px 0;
	}
	.wx-rule.wx-line {
		height: 36px;
		padding: 8px;
	}

	.wx-field {
		font-weight: var(--wx-font-weight-md);
	}

	.wx-filter {
		display: inline-block;
		max-width: 90%;
		overflow: hidden;
		text-overflow: ellipsis;
		margin-right: 45px;
	}

	.wx-value {
		color: var(--wx-filter-value-color);
	}

	.wx-menu-icon {
		position: absolute;
		right: 8px;
		cursor: pointer;
		width: var(--wx-line-height);
		height: var(--wx-line-height);
		line-height: var(--wx-line-height);
		text-align: center;
		border-radius: var(--wx-line-height);
	}

	.wx-menu-icon.wxi-dots-h {
		background: var(--wx-background);
	}

	.wx-menu-icon:hover {
		background-image: linear-gradient(
			rgba(0, 0, 0, 0.1) 0%,
			rgba(0, 0, 0, 0.1) 100%
		);
	}
</style>
