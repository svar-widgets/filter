<!--
	Filter query input with syntax highlighting and autocomplete.

	Maintains dual state: `text` (labels, displayed) and `value` (IDs, bindable).
	Highlight layer overlays transparent input text; scroll positions are synced.
	showErrors accepts cursor position to suppress error styling at active token.
-->
<script>
	import { getContext, untrack } from "svelte";
	import {
		parseSet,
		getAutocompleteContext,
		getSuggestions,
		prepareFields,
		buildFieldMaps,
		idsToLabels,
		labelsToIds,
	} from "@svar-ui/filter-store";

	import Suggest from "./suggest/Suggest.svelte";
	import QueryHighlight from "./QueryHighlight.svelte";

	import { locale } from "@svar-ui/lib-dom";
	import { en } from "@svar-ui/filter-locales";
	const i18n = (getContext("wx-i18n") || locale(en)).getGroup("filter");

	let {
		value = $bindable(""),
		placeholder = "",
		onchange = null,
		parse: parseMode = "allowFreeText",
		fields = [],
		options = {},
	} = $props();

	let parseEnabled = $derived(parseMode !== "none");
	let strictParser = $derived(parseMode === "strict");

	// Prepare fields: sanitize labels for parser-safe matching
	let pFields = $derived(prepareFields(fields));
	let fieldMaps = $derived(buildFieldMaps(pFields));

	function getErrorMessage(error) {
		if (!error || typeof error === "boolean") return null;

		const fn = i18n(error.code.toString().toLowerCase());
		if (typeof fn === "function") return fn(error.field, error.value);
		return error.message || fn;
	}

	// Internal text (labels) synced with external value (IDs)
	let text = $state("");
	let isInternalChange = false;
	let hasBeenSet = false;

	$effect(() => {
		value;
		untrack(() => {
			if (isInternalChange) {
				isInternalChange = false;
				return;
			}
			if (!hasBeenSet) {
				hasBeenSet = true;
				if (!value) return;
			}
			text = idsToLabels(value, fieldMaps);
			triggerFilter();
		});
	});

	let progressActive = $state(false);
	let progressKey = $state(0);
	let inputEl = $state(null);
	let highlightEl = $state(null);
	let showErrors = $state(true);
	let cursorPos = $state(0);
	let suggestRef = $state(null);
	let suggestOpen = $state(false);

	let parseResult = $derived(
		parseEnabled
			? parseSet(text, pFields, options, {
					allowFreeText: !strictParser,
				})
			: null
	);

	let activeTokenInfo = $derived.by(() => {
		if (!parseEnabled) return null;
		return getAutocompleteContext(text, cursorPos, pFields);
	});

	let currentTokenValue = $derived(
		activeTokenInfo
			? text
					.slice(activeTokenInfo.start, activeTokenInfo.end)
					.toLowerCase()
			: ""
	);

	let suggestions = $derived.by(() => {
		if (!suggestOpen) return [];
		// no autocomplete for strict-match-any
		if (activeTokenInfo && text[activeTokenInfo.start - 1] === "#")
			return [];
		const all = getSuggestions(activeTokenInfo, pFields, options);
		if (!all || !currentTokenValue) return all || [];
		// Hide suggestion that exactly matches what's already typed
		return all.filter(s => s.id.toLowerCase() !== currentTokenValue);
	});

	function startProgress() {
		progressKey++; // Increment key to restart CSS animation via {#key} block
		progressActive = true;
	}

	function endProgress() {
		progressActive = false;
	}

	function closeSuggestions() {
		suggestOpen = false;
	}

	function onkeydown(e) {
		if (suggestions && suggestions.length) {
			suggestRef.keydown(e);
		}
		// Enter triggers filter unless Suggest handled it (selected an item)
		if (e.key === "Enter" && !e.defaultPrevented) {
			triggerFilter();
		}
	}

	function setText(newText) {
		text = newText;
		isInternalChange = true;
		value = labelsToIds(newText, fieldMaps);
	}

	function selectByEvent(event) {
		const insertText = event.id;
		if (!activeTokenInfo) return;

		const before = text.slice(0, activeTokenInfo.start);
		const after = text.slice(activeTokenInfo.end);

		let newText;
		let newCursorPos;
		if (activeTokenInfo.type === "field") {
			// Append ": " after field name per query syntax
			newText = `${before}${insertText}: ${after}`;
			newCursorPos = before.length + insertText.length + 2;
		} else if (activeTokenInfo.type === "predicate") {
			// Append ": " after predicate (e.g., "StartDate.year: ")
			newText = `${before}${insertText}: ${after}`;
			newCursorPos = before.length + insertText.length + 2;
		} else {
			// Add space after colon if missing: "field:" → "field: value"
			const needsSpace = before.endsWith(":");
			const prefix = needsSpace ? " " : "";
			newText = `${before}${prefix}${insertText}${after}`;
			newCursorPos = before.length + prefix.length + insertText.length;
		}

		setText(newText);
		cursorPos = newCursorPos;
		closeSuggestions();

		// Wait for Svelte to update DOM before setting cursor position
		requestAnimationFrame(() => {
			if (inputEl) {
				inputEl.setSelectionRange(newCursorPos, newCursorPos);
				inputEl.focus();
			}
		});
	}

	function triggerFilter() {
		closeSuggestions();
		// Normalize text: convert any typed field IDs to labels
		text = idsToLabels(text, fieldMaps);
		showErrors = true;
		if (onchange) {
			if (parseEnabled && parseResult) {
				const error = parseResult.isInvalid
					? {
							...parseResult.isInvalid,
							message: getErrorMessage(parseResult.isInvalid),
						}
					: null;

				const finalText =
					!error || error.code === "NO_DATA"
						? parseResult.naturalText || ""
						: text;
				onchange({
					parsed: parseResult,
					value: parseResult.config,
					text: finalText,
					error,
					startProgress,
					endProgress,
				});
			} else {
				onchange({ value, text, startProgress, endProgress });
			}
		}
	}

	function handleInput(e) {
		text = e.target.value;
		isInternalChange = true;
		value = labelsToIds(text, fieldMaps);
		cursorPos = e.target.selectionStart;
		showErrors = cursorPos; // Pass position to suppress errors at active token
		suggestOpen = true;
	}

	function handleScroll() {
		if (highlightEl && inputEl) {
			highlightEl.scrollLeft = inputEl.scrollLeft;
		}
	}

	function handleInputClick() {
		closeSuggestions();
	}

	function clear() {
		text = "";
		isInternalChange = true;
		value = "";
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="wx-filter-query" {onkeydown}>
	<div class="wx-progress-bar" class:active={progressActive}>
		{#if progressActive}
			{#key progressKey}
				<div class="wx-progress-fill"></div>
			{/key}
		{/if}
	</div>
	<div class="wx-filter-query-row">
		<div class="wx-filter-query-input-wrapper">
			{#if parseEnabled}
				<div
					class="wx-filter-query-highlight"
					class:wx-placeholder={!text}
					bind:this={highlightEl}
					aria-hidden="true"
				>
					{#if text}
						<QueryHighlight
							parse={parseMode}
							query={text}
							fields={pFields}
							{options}
							inline={true}
							{showErrors}
							{cursorPos}
						/>&nbsp;
					{:else}
						{placeholder}
					{/if}
				</div>
			{/if}
			<input
				type="text"
				class="wx-filter-query-input"
				class:wx-parse-mode={parseEnabled}
				bind:this={inputEl}
				value={text}
				placeholder={parseEnabled ? "" : placeholder}
				oninput={handleInput}
				onscroll={handleScroll}
				onclick={handleInputClick}
			/>
		</div>
		{#if text}
			<button
				type="button"
				class="wx-filter-query-clear"
				onclick={clear}
				aria-label="Clear"
			>
				<svg viewBox="0 0 24 24" width="16" height="16">
					<path
						fill="currentColor"
						d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
					/>
				</svg>
			</button>
		{/if}
		<button
			type="button"
			class="wx-filter-query-search"
			onclick={triggerFilter}
			aria-label="Search"
		>
			<svg viewBox="0 0 24 24" width="18" height="18">
				<path
					fill="currentColor"
					d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
				/>
			</svg>
		</button>
	</div>
	<Suggest
		bind:this={suggestRef}
		items={suggestions}
		onselect={selectByEvent}
		onclose={closeSuggestions}
	>
		{#snippet children({ option })}
			{option.label}
		{/snippet}
	</Suggest>
</div>

<style>
	.wx-filter-query {
		display: flex;
		flex-direction: column;
		position: relative;
	}

	.wx-progress-bar {
		width: 100%;
		height: 3px;
		border-radius: 2px 2px 0 0;
		overflow: hidden;
		position: absolute;
		top: 0;
		left: 0;
	}

	.wx-progress-bar.active {
		background: var(--wx-background-alt);
	}

	.wx-progress-fill {
		height: 100%;
		background: var(--wx-color-primary);
		animation: wx-fill-progress 3000ms linear forwards;
	}

	@keyframes wx-fill-progress {
		from {
			width: 0%;
		}
		to {
			width: 100%;
			background: var(--wx-color-success);
		}
	}

	.wx-filter-query-row {
		display: flex;
		flex-direction: row;
		align-items: center;
		border: var(--wx-border);
		border-radius: var(--wx-border-radius);
		background: var(--wx-background);
		overflow: hidden;
	}

	.wx-filter-query-input-wrapper {
		flex: 1;
		position: relative;
		overflow: hidden;
	}

	.wx-filter-query-highlight {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		padding: 6px 12px;
		white-space: pre;
		overflow-x: auto;
		pointer-events: none;
		scrollbar-width: none;
	}

	.wx-filter-query-highlight::-webkit-scrollbar {
		display: none;
	}

	.wx-filter-query-input {
		width: 100%;
		border: none;
		outline: none;
		padding: var(--wx-padding) 12px;
		white-space: pre;
		background: transparent;
		color: var(--wx-color-font);
		font-size: var(--wx-font-size);
		font-family: var(--wx-font-family);
	}

	.wx-filter-query-input.wx-parse-mode {
		color: transparent;
		caret-color: var(--wx-color-font);
		position: relative;
	}

	.wx-filter-query-input::placeholder {
		color: var(--wx-color-font-alt);
	}

	.wx-filter-query-highlight.wx-placeholder {
		color: var(--wx-color-font-alt);
	}

	.wx-filter-query-clear {
		display: flex;
		align-items: center;
		justify-content: center;
		border: none;
		background: transparent;
		cursor: pointer;
		padding: var(--wx-padding);
		color: var(--wx-color-font-alt);
	}

	.wx-filter-query-clear:hover {
		color: var(--wx-color-font);
	}

	.wx-filter-query-search {
		display: flex;
		align-items: center;
		justify-content: center;
		border: none;
		border-left: var(--wx-border);
		border-radius: var(--wx-border-radius);
		margin: 2px;
		background: var(--wx-color-primary);
		cursor: pointer;
		padding: 6px 12px;
		color: var(--wx-color-primary-font);
		position: relative;
	}

	.wx-filter-query-search:hover {
		background: color-mix(in srgb, var(--wx-color-primary) 90%, black);
		/*background: var(--wx-color-primary-hover);*/
	}
</style>
