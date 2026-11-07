<script lang="ts">
	/* eslint-disable no-bitwise */

	import {
		RichSelect,
		Text,
		Button,
		DatePicker,
		Checkbox,
		DateRangePicker,
		Combo,
	} from "@svar-ui/svelte-core";
	import type { ILocale } from "@svar-ui/svelte-core";
	import { getFilters, getFilter } from "@svar-ui/filter-store";
	import type {
		AnyData,
		IField,
		IFilter,
		IFilterRule,
		TFilterType,
		TPredicate,
		TRangeValue,
		TSingleOptions,
		TType,
	} from "@svar-ui/filter-store";
	import { dateToString } from "@svar-ui/lib-dom";
	import { getContext, setContext, onMount, untrack } from "svelte";
	import type { Component, ComponentProps, Snippet } from "svelte";
	import type { IRawTerms } from "../../types";

	type TComboOption = { id: AnyData; label: string; emptyLabel?: string };
	// core types declare Combo children without the { option } argument
	const TupleCombo = Combo as unknown as Component<
		Omit<ComponentProps<typeof Combo>, "options" | "children"> & {
			options: TComboOption[];
			children: Snippet<[{ option: TComboOption }]>;
		}
	>;

	type Props = {
		fields?: IField[] | null;
		fieldsSelector?: boolean;
		field?: string | null;
		buttons?: boolean;
		options?: TSingleOptions | null;
		includes?: AnyData[] | null;
		type?: TType;
		filter?: TFilterType | "";
		value?: AnyData | TRangeValue | null;
		format?: string | ((value: AnyData) => string) | null;
		predicate?: TPredicate | null;
		onapply?: (ev: { value: IFilter }) => void;
		oncancel?: () => void;
		onchange?: (ev: { value: IFilter }) => void;
	};

	let {
		fields = null,
		fieldsSelector = true,
		field = null,
		buttons = true,
		options = null,
		includes = null,
		type = "text",
		filter = "",
		value = "",
		format = null,
		predicate = null,
		onapply,
		oncancel,
		onchange,
	}: Props = $props();

	const locale = getContext<ILocale>("wx-i18n");
	const l = locale.getRaw() as unknown as IRawTerms;
	const f = (l.filter?.dateFormat || l.formats?.dateFormat)!;
	const dateFormat = dateToString(f, l.calendar);
	const _ = locale.getGroup("filter");

	setContext("wx-input-id", null);

	// signal constants for each kind of modification
	const ACTION_FIELD_CHANGE = 1;
	const ACTION_FILTER_CHANGE = 2;
	const ACTION_VALUE_CHANGE = 4;
	const ACTION_INCLUDES_CHANGE = 8;
	const ACTION_TYPE_CHANGE = 16;
	const ACTION_CHANGE = 32;
	const ACTION_OPTIONS_CHANGE = 64;

	// values of different types go through setState(), so they are loosely typed
	let _filter = $state<any>(),
		_field = $state<any>(),
		_type = $state<any>(),
		_value = $state<any>(),
		_includes = $state<AnyData[]>([]),
		_options = $state<AnyData[] | null>(),
		_format = $state<string | ((value: AnyData) => string) | null>(),
		_predicate = $state<TPredicate | null>(),
		ready = $state(false),
		s = 0;

	let providedOptions = $state<AnyData[] | null>(null);
	async function loadOptions(field: string) {
		if (!options || typeof options !== "function") return;

		const result = await options(field);
		providedOptions = result || [];
	}

	// trigger recalculation on change of incoming parameters
	$effect(() => {
		field;
		if (ready)
			untrack(() => execSignal(setState(ACTION_FIELD_CHANGE, field)));
	});
	$effect(() => {
		type;
		if (ready)
			untrack(() => execSignal(setState(ACTION_TYPE_CHANGE, type)));
	});
	$effect(() => {
		filter;
		if (ready)
			untrack(() => execSignal(setState(ACTION_FILTER_CHANGE, filter)));
	});
	$effect(() => {
		value;
		if (ready) untrack(() => setState(ACTION_VALUE_CHANGE, value));
	});
	$effect(() => {
		includes;
		if (ready)
			untrack(() =>
				execSignal(setState(ACTION_INCLUDES_CHANGE, includes))
			);
	});
	$effect(() => {
		const currOptions = Array.isArray(options) ? options : providedOptions;
		if (ready)
			untrack(() =>
				execSignal(setState(ACTION_OPTIONS_CHANGE, currOptions))
			);
	});
	$effect(() => {
		if (format && !fields) _format = format;
		if (predicate && !fields) _predicate = predicate;
	});

	// delay recalculation till the component fully ready
	// without it the request-options signal will be ignored
	onMount(() => {
		ready = true;
	});

	// bind new values to local vars
	// store the signal for the next recalculation
	const arr2str = (v: AnyData[] | null) => (v ? v.toString() : "");
	function setState(signal: number, value: any): number {
		switch (signal) {
			case ACTION_FIELD_CHANGE:
				if (_field !== value) {
					_field = value;
					return signal;
				}
				break;
			case ACTION_TYPE_CHANGE:
				if (_type !== value) {
					_type = value;
					return signal;
				}
				break;
			case ACTION_FILTER_CHANGE:
				if (_filter !== value) {
					_filter = value;
					return signal;
				}
				break;
			case ACTION_VALUE_CHANGE:
				if (_value !== value) {
					_value = value;
					return signal;
				}
				break;
			case ACTION_INCLUDES_CHANGE:
				if (arr2str(_includes) != arr2str(value)) {
					_includes = value || [];
					return signal;
				}
				break;
			case ACTION_OPTIONS_CHANGE:
				if (_options !== value) {
					_options = value || [];
					return signal;
				}
				break;
		}
		return 0;
	}

	// collect signal values, recalculate and dispatch
	let timer: ReturnType<typeof setTimeout> | null = null;
	function execSignal(signal: number) {
		s = s | signal;
		if (!timer) {
			// use a delay to collect all changes from incoming parameters
			timer = setTimeout(() => {
				const v = s;
				timer = null;
				s = 0;
				runSignal(v);
			});
		}
	}

	let allSelected = $state(),
		visibleValues = $state<AnyData[]>([]),
		rule = $state<IFilterRule>(),
		rules = $state<{ id: TFilterType; label: string }[]>([]);

	function runSignal(s: number) {
		if (s & ACTION_FIELD_CHANGE) {
			// if fields are defined, get field type
			if (fields) {
				_options = null;
				const nextField = fields.find(a => a.id === _field)!;
				const isDate =
					_value instanceof Date ||
					(_value && typeof _value === "object");
				const isTuple = nextField.type === "tuple" || _type == "tuple";
				if (
					(isDate && nextField.type !== "date") ||
					(!isDate && nextField.type == "date") ||
					(isNaN(_value) && nextField.type == "number") ||
					isTuple
				) {
					_value = null;
				} else if (
					nextField.type === "text" &&
					typeof _value !== "string"
				) {
					_value = _value || _value === 0 ? _value.toString() : "";
				}
				_format = nextField.format;
				_predicate = nextField.predicate;

				s = s | setState(ACTION_TYPE_CHANGE, nextField.type || "text");

				loadOptions(_field);
			}
		}

		if (s & ACTION_TYPE_CHANGE) {
			// set list of filtering rules for current type
			rules = getFilters(_type).map(a => ({
				id: a.id,
				label: _(a.label || a.id),
			}));
			// validate if current filter is applicable for current type
			// if not, reset filter to null to trigger default filter selection
			if (!rules.some(rule => rule?.id === _filter)) {
				_filter = null;
			}
		}

		if (s & ACTION_TYPE_CHANGE || s & ACTION_FILTER_CHANGE) {
			// actualize rule
			// same id can result in different rules for different types
			rule = getFilter(_filter, _type);
			if (!rule) {
				rule = getFilters(_type).find(a => a.default)!;
				s = s | setState(ACTION_FILTER_CHANGE, rule.id);
			}

			if (
				typeof _value === "object" &&
				!(_value instanceof Date) &&
				!rule.range
			) {
				s =
					s |
					setState(ACTION_VALUE_CHANGE, _type === "date" ? null : "");
			}
		}

		if (
			s & ACTION_FILTER_CHANGE ||
			s & ACTION_VALUE_CHANGE ||
			s & ACTION_OPTIONS_CHANGE
		) {
			if (_options) {
				// build match option function
				const handler =
					_value || _value === 0
						? (v: AnyData) => rule!.handler(v, _value || "")
						: null;

				// list of matching options
				visibleValues =
					_filter && handler ? _options.filter(handler) : _options;

				// if we have list of includes, ensure that they are in the list
				let nextIncs = _includes;
				if (_includes.length) {
					nextIncs = _includes.filter(x => visibleValues.includes(x));
				}

				if (nextIncs.length) {
					// not all options in the list, update includes
					if (nextIncs.length !== _includes.length) {
						s = s | setState(ACTION_INCLUDES_CHANGE, nextIncs);
					}
				} else {
					// there are no includes, switch back to select all visible values
					s =
						s |
						setState(ACTION_INCLUDES_CHANGE, [...visibleValues]);
				}
			} else {
				visibleValues = [];
			}
		}

		if (s & ACTION_INCLUDES_CHANGE) {
			// correct all-selected button state
			allSelected = _includes.length === visibleValues.length;
		}

		if (s & ACTION_CHANGE) {
			// dispatch change signal when any of the parameters changed through UI
			const rule = getRule();
			onchange?.({ value: rule });
		}
	}

	// is all options checked or not
	function doApply() {
		const rule = getRule();
		onapply?.({ value: rule });
	}

	function doCancel() {
		oncancel?.();
	}

	// select-all button clicked
	function toggleAll() {
		allSelected = !allSelected;
		execSignal(
			setState(
				ACTION_INCLUDES_CHANGE,
				allSelected ? [...visibleValues] : []
			) | ACTION_CHANGE
		);
	}

	// click on option in the list
	function handleChange(ev: { value: boolean; inputValue: string | number }) {
		const { inputValue, value } = ev;
		const next = value
			? [..._includes, inputValue]
			: _includes.filter(a => a != inputValue);
		execSignal(setState(ACTION_INCLUDES_CHANGE, next) | ACTION_CHANGE);
	}

	// text value changed
	function changeValue({ value }: { value: any }) {
		if (value === "$empty") value = "";
		execSignal(setState(ACTION_VALUE_CHANGE, value) | ACTION_CHANGE);
	}

	// different field selected
	function changeField({ value }: { value: string | number }) {
		execSignal(setState(ACTION_FIELD_CHANGE, value) | ACTION_CHANGE);
	}

	// different filter selected
	function changeFilter({ value }: { value: string | number }) {
		execSignal(setState(ACTION_FILTER_CHANGE, value) | ACTION_CHANGE);
	}

	// collect info and return new config object
	function getRule(): IFilter {
		const out: Partial<IFilter> = {
			filter: _filter,
			value: _value,
			type: _type,
		};

		if (_predicate) out.predicate = _predicate;

		if (_field) out.field = _field;

		if (
			_includes &&
			_includes.length &&
			_includes.length !== visibleValues.length
		)
			out.includes = [..._includes];
		else out.includes = [];

		return out as IFilter;
	}

	function getLabel(v: AnyData): string {
		if (_format && typeof _format == "function") return _format(v);
		if (v instanceof Date)
			return _format
				? dateToString(_format, l.calendar)(v)
				: dateFormat(v);
		return typeof v === "string" ? v : v.toString();
	}
	function getComboOptions(
		options: AnyData[] | null | undefined
	): TComboOption[] {
		let arr: TComboOption[] = options
			? options.map(op => ({ id: op, label: getLabel(op) }))
			: [];
		const empty: TComboOption[] = [
			{ id: "$empty", label: "", emptyLabel: _("None") },
		];
		return empty.concat(arr);
	}

	let input = $state<HTMLElement>();
	$effect(() => {
		if (_field && input) {
			setTimeout(() => {
				input?.querySelector("input")?.focus();
			}, 1);
		}
	});
</script>

<div class="wx-filter-editor">
	{#if fields && fieldsSelector}
		<RichSelect onchange={changeField} options={fields} value={_field} />
	{/if}
	<div class="wx-wrapper">
		<div class="wx-cell">
			<RichSelect
				onchange={changeFilter}
				options={rules}
				value={_filter}
				placeholder={_("Click to select")}
			/>
		</div>
		<div class="wx-cell" bind:this={input}>
			{#if _type === "date"}
				{#if _filter == "between" || _filter == "notBetween"}
					<DateRangePicker
						format={f}
						value={_value}
						buttons={["done", "clear", "today"]}
						onchange={changeValue}
					/>
				{:else}
					<DatePicker
						format={f}
						value={_value}
						onchange={changeValue}
					/>
				{/if}
			{:else if _type === "number"}
				<Text value={_value} onchange={changeValue} type="number" />
			{:else if _type === "tuple"}
				<TupleCombo
					value={_value}
					options={getComboOptions(_options)}
					onchange={changeValue}
				>
					{#snippet children({ option })}
						{option.emptyLabel || option.label}
					{/snippet}
				</TupleCombo>
			{:else}
				<Text value={_value} onchange={changeValue} />
			{/if}
		</div>
	</div>

	<Button onclick={toggleAll}>
		{allSelected ? _("Unselect all") : _("Select all")}
	</Button>
	<div class="wx-list" role="listbox">
		{#each visibleValues as option, i}
			<!-- svelte-ignore a11y_role_has_required_aria_props -->
			<div class="wx-item" tabindex={i ? -1 : 0} role="option">
				<Checkbox
					label={getLabel(option)}
					inputValue={option as string | number}
					value={_includes && _includes.includes(option)}
					onchange={handleChange}
				/>
			</div>
		{/each}
	</div>

	{#if buttons}
		<div class="wx-wrapper">
			<Button type={"secondary"} onclick={doCancel}>{_("Cancel")}</Button>
			<Button type={"primary"} onclick={doApply}>{_("Apply")}</Button>
		</div>
	{/if}
</div>

<style>
	.wx-filter-editor {
		--wx-input-border: var(--wx-filter-border);
	}
	.wx-wrapper {
		display: flex;
		justify-content: right;
		gap: 10px;
		align-items: center;
		margin: 8px 0;
	}

	.wx-cell {
		flex: 1;
	}

	.wx-list {
		height: 150px;
		overflow-y: auto;
		margin: 8px 0;
		border: var(--wx-filter-border);
	}

	.wx-item {
		user-select: none;
		padding: 8px 12px;
		border-bottom: var(--wx-filter-border);
	}

	.wx-item :global(label > span + span) {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
</style>
