<script>
	import { getContext, untrack } from "svelte";
	import {
		RichSelect,
		Text,
		DatePicker,
		DateRangePicker,
	} from "wx-svelte-core";
	import { createFilterRule } from "wx-filter-store";

	let { fields = [], debounce = 300, onchange } = $props();

	let lastField = $state(),
		timer = $state(),
		lastValue = $state({});

	const locale = getContext("wx-i18n");
	const l = locale.getRaw();
	const f = l.filter?.dateFormat || l.formats?.dateFormat;
	const _ = locale.getGroup("filter");

	let normalizedFields = $derived(normalizeFields(fields));

	$effect.pre(() => {
		normalizedFields;
		// prepare lastField and lastValue
		untrack(() => {
			const values = {};
			normalizedFields.forEach(field => {
				if (field.type === "dynamic") {
					field.by.forEach(f => {
						if (typeof f.value !== "undefined")
							values[f.id] = f.value;
					});
					lastField = field.by[0].id;
				} else if (field.type === "all") {
					values[field.type] = field.value ?? "";
				} else if (typeof field.value !== "undefined") {
					values[field.id] = field.value;
				}
			});
			lastValue = values;
		});
	});

	let filters = $derived.by(() => {
		return normalizedFields.map(field => {
			let base = {
				field: field.type,
				label: field.label,
				placeholder: field.placeholder,
			};

			if (field.type === "dynamic") {
				base.dynamicField = true;
				base.field = lastField;

				const currentField = field.by.find(f => f.id === base.field);
				if (currentField) {
					base = {
						...currentField,
						...base,
						placeholder:
							currentField.placeholder ?? base.placeholder,
					};
				}
			} else if (field.type !== "all") {
				base = { ...base, ...field, field: field.id };
			}

			if (field.by) base.optionsBy = getDynamicOptions(field.by);
			base.value = lastValue[base.field];

			return { type: "text", filter: "contains", ...base };
		});
	});

	function updateValue(value, field, delay) {
		lastValue[field] = value === "$empty" ? "" : value;

		dispatchChange(delay);
	}

	function updateFiltersField(value) {
		if (lastField !== value) {
			if (lastField) {
				lastValue = { ...lastValue, [lastField]: "" };
			}
			lastField = value;
		}

		dispatchChange();
	}

	function dispatchChange(delay) {
		if (timer) clearTimeout(timer);
		timer = setTimeout(() => {
			onchange && onchange({ value: getRules() });
		}, delay || debounce);
	}

	function getRules() {
		const rules = filters.map(f => getRule(f)).filter(a => !!a);
		if (rules.length === 1 && rules[0]?.glue === "or") return rules[0];
		return {
			glue: "and",
			rules,
		};
	}

	function getRule(filter) {
		if (filter.field === "all")
			return createFilterRule(
				filter.optionsBy,
				"contains",
				lastValue[filter.field]
			);
		const value = lastValue[filter.field];
		if (!value) return null;

		return {
			field: filter.field,
			filter: filter.filter,
			type: filter.type,
			value,
		};
	}

	function normalizeFields(fields) {
		return fields.map(field => {
			if (field.type === "all" || field.type === "dynamic") {
				return {
					...field,
					by: field.by.map(b => normalizeField(b)),
				};
			}
			return normalizeField(field);
		});
	}

	function normalizeField(field) {
		if (typeof field === "string")
			return { id: field, type: "text", filter: "contains" };
		return {
			...field,
			filter: field.filter || (field.options ? "equal" : "contains"),
			options:
				field.type !== "date" &&
				field.options &&
				getFieldOptions(field),
		};
	}

	function getFieldOptions(field) {
		const options = field.options.map(a => {
			if (typeof a === "string" || typeof a === "number") {
				return { id: a, label: a };
			}
			return a;
		});

		options.unshift({ id: "$empty", label: _("None") });

		return options;
	}

	function getDynamicOptions(arr) {
		return arr.map(a => ({ id: a.id, label: a.id }));
	}
</script>

<div class="wx-filter-bar">
	{#each filters as filter, i}
		{#if filter.label}
			<div class="wx-label">
				{filter.label}
			</div>
		{/if}
		{#if filter.dynamicField}
			<div class="wx-select">
				<RichSelect
					value={filter.field}
					options={filter.optionsBy}
					onchange={({ value }) => updateFiltersField(value, i)}
				/>
			</div>
		{/if}
		{#if filter.options}
			<div class="wx-select">
				<RichSelect
					value={filter.value}
					placeholder={filter.placeholder ??
						`${_("filter by")} ${filter.field}`}
					options={filter.options}
					onchange={({ value }) =>
						updateValue(value, filter.field, 1)}
				/>
			</div>
		{:else if filter.type === "text" || filter.type === "number"}
			<div class="wx-text">
				<Text
					value={filter.value}
					placeholder={filter.placeholder ??
						`${_("filter by")} ${filter.field} (${_(filter.filter)})`}
					onchange={({ value, input }) => {
						if (input) updateValue(value, filter.field, 0);
					}}
					type={filter.type}
				/>
			</div>
		{:else if filter.type === "date"}
			<div class="wx-date">
				{#if filter.filter === "between" || filter.filter === "notBetween"}
					<DateRangePicker
						value={filter.value}
						format={f}
						buttons={["done", "clear", "today"]}
						placeholder={filter.placeholder ??
							`${_("filter by")} ${filter.field} (${_(filter.filter)})`}
						onchange={({ value }) =>
							updateValue(value, filter.field, 1)}
					/>
				{:else}
					<DatePicker
						value={filter.value}
						format={f}
						placeholder={filter.placeholder ??
							`${_("filter by")} ${filter.field} (${_(filter.filter)})`}
						onchange={({ value }) =>
							updateValue(value, filter.field, 1)}
					/>
				{/if}
			</div>
		{/if}
	{/each}
</div>

<style>
	.wx-filter-bar {
		display: flex;
		padding: 14px 2px;
		width: 610px;
		gap: 10px;
	}

	.wx-label {
		font-family: var(--wx-label-font-family);
		font-size: var(--wx-label-font-size);
		line-height: var(--wx-label-line-height);
		font-weight: var(--wx-label-font-weight);
		color: var(--wx-label-font-color);
		align-content: center;
		max-width: 160px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.wx-select {
		flex: 1;
	}

	.wx-text,
	.wx-date {
		flex: 2;
	}
</style>
