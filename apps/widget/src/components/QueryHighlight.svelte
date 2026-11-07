<script lang="ts">
	import { getQueryHtml } from "@svar-ui/filter-store";
	import type { AnyData, IDataHash, IField } from "@svar-ui/filter-store";
	import type { TFilterQueryParse } from "../types";

	type Props = {
		query?: string;
		fields?: IField[];
		options?: IDataHash<AnyData[]>;
		inline?: boolean;
		showErrors?: boolean | number;
		cursorPos?: number;
		parse?: TFilterQueryParse;
	};

	let {
		query = "",
		fields = [],
		options = {},
		inline = false,
		showErrors = true,
		cursorPos = -1,
		parse = "allowFreeText",
	}: Props = $props();

	let highlightedHtml = $derived(
		getQueryHtml(query, {
			fields,
			options,
			showErrors,
			cursorPos,
			allowFreeText: parse === "allowFreeText",
		})
	);
</script>

{#if inline}
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html highlightedHtml}
{:else if query}
	<div class="wx-query-highlight">
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html highlightedHtml}
	</div>
{/if}

<style>
	.wx-query-highlight {
		font-family: monospace;
		padding: var(--wx-padding) 12px;
		background: var(--wx-background-alt);
		border: var(--wx-border);
		border-radius: var(--wx-border-radius);
		margin-top: var(--wx-padding);
		white-space: pre-wrap;
		word-break: break-word;
	}
</style>
