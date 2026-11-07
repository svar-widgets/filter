<script lang="ts">
	import { getContext, untrack } from "svelte";
	import {
		RichSelect,
		Text,
		DatePicker,
		DateRangePicker,
	} from "@svar-ui/svelte-core";
	import type { ILocale } from "@svar-ui/svelte-core";
	import { createFilterRule } from "@svar-ui/filter-store";
	import type {
		IField,
		IFilter,
		IFilterBarField,
		IFilterSet,
		TFilterType,
	} from "@svar-ui/filter-store";
	import type { IRawTerms, TFilterBarField } from "../../types";

	type Props = {
		fields?: TFilterBarField[];
		debounce?: number;
		onchange?: (ev: { value: IFilterSet }) => void;
	};

	let { fields = [], debounce = 300, onchange }: Props = $props();

	type TBarOption = { id: string | number; label: string };
	// normalized field or field group ("all", "dynamic" have `by`)
	type TBarField = Omit<IFilterBarField, "id" | "options"> & {
		id?: string;
		options?: TBarOption[] | false;
		by?: TBarField[];
	};
	// a field as rendered in the bar
	type TBarFilter = Omit<TBarField, "by"> & {
		field: string;
		filter: TFilterType;
		dynamicField?: boolean;
		optionsBy?: TBarOption[];
	};

	let lastField = $state<string>(),
		timer = $state<ReturnType<typeof setTimeout>>(),
		lastValue = $state<Record<string, any>>({});

	const locale = getContext<ILocale>("wx-i18n");
	const l = locale.getRaw() as unknown as IRawTerms;
	const f = l.filter?.dateFormat || l.formats?.dateFormat;
	const _ = locale.getGroup("filter");

	let normalizedFields = $derived(normalizeFields(fields));

	$effect.pre(() => {
		normalizedFields;
		// prepare lastField and lastValue
		untrack(() => {
			const values: Record<string, any> = {};
			normalizedFields.forEach(field => {
				if (field.type === "dynamic") {
					field.by!.forEach(f => {
						if (typeof f.value !== "undefined")
							values[f.id!] = f.value;
					});
					lastField = field.by![0].id;
				} else if (field.type === "all") {
					values[field.type] = field.value ?? "";
				} else if (typeof field.value !== "undefined") {
					values[field.id!] = field.value;
				}
			});
			lastValue = values;
		});
	});

	let filters = $derived.by(() => {
		return normalizedFields.map(field => {
			// type and filter default to "text" and "contains" below
			let base: Omit<TBarFilter, "type" | "filter"> &
				Partial<TBarFilter> = {
				field: field.type,
				label: field.label,
				placeholder: field.placeholder,
			};

			if (field.type === "dynamic") {
				base.dynamicField = true;
				base.field = lastField!;

				const currentField = field.by!.find(f => f.id === base.field);
				if (currentField) {
					base = {
						...base,
						...currentField,
					};
				}
			} else if (field.type !== "all") {
				base = { ...base, ...field, field: field.id! };
			}

			if (field.by) base.optionsBy = getDynamicOptions(field.by);
			base.value = lastValue[base.field];

			return { type: "text", filter: "contains", ...base } as TBarFilter;
		});
	});

	function updateValue(value: any, field: string, delay?: number) {
		lastValue[field] = value === "$empty" ? "" : value;

		dispatchChange(delay);
	}

	function updateFiltersField(value: string) {
		if (lastField !== value) {
			if (lastField) {
				lastValue = { ...lastValue, [lastField]: "" };
			}
			lastField = value;
		}

		dispatchChange();
	}

	function dispatchChange(delay?: number) {
		if (timer) clearTimeout(timer);
		timer = setTimeout(() => {
			onchange?.({ value: getRules() });
		}, delay || debounce);
	}

	function getRules(): IFilterSet {
		const rules = filters.map(f => getRule(f)).filter(a => !!a);
		if (rules.length === 1 && (rules[0] as IFilterSet)?.glue === "or")
			return rules[0] as IFilterSet;
		return {
			glue: "and",
			rules,
		};
	}

	function getRule(filter: TBarFilter): IFilter | IFilterSet | null {
		if (filter.field === "all")
			return createFilterRule(
				// field ids only, type falls back to "text"
				filter.optionsBy as unknown as IField[],
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
		} as IFilter;
	}

	function normalizeFields(fields: TFilterBarField[]): TBarField[] {
		return fields.map(field => {
			if (
				typeof field !== "string" &&
				(field.type === "all" || field.type === "dynamic")
			) {
				const group = field as Extract<
					TFilterBarField,
					{ by: unknown }
				>;
				return {
					...group,
					by: group.by.map(b => normalizeField(b)),
				};
			}
			return normalizeField(field as string | IFilterBarField);
		});
	}

	function normalizeField(field: string | IFilterBarField): TBarField {
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

	function getFieldOptions(field: IFilterBarField) {
		const options: TBarOption[] = field.options!.map(a => {
			if (typeof a === "string" || typeof a === "number") {
				// numbers are rendered as they are
				return { id: a, label: a as string };
			}
			return a as TBarOption;
		});

		options.unshift({ id: "$empty", label: _("None") });

		return options;
	}

	function getDynamicOptions(arr: TBarField[]): TBarOption[] {
		return arr.map(a => ({ id: a.id!, label: a.id! }));
	}
</script>

<div class="wx-filter-bar">
	{#each filters as filter}
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
					onchange={({ value }) =>
						updateFiltersField(value as string)}
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
