// Transforms IFilterSet configurations into executable filter functions.
//
// Wildcard field="*" expands to OR (positive) or AND (negative) per De Morgan's law.
// Lazy getters in getOptionsMap defer computation until field is actually accessed.

import type {
	IFilter,
	IFilterSet,
	IDataHash,
	IField,
	TFilterType,
	ArrayFilterFunction,
	FilterFunction,
	LocatorConfig,
	OptionsMap,
	FilterOptions,
} from "./types";
import { getFilter } from "./filters";
import { parseDate } from "./dates";

type PredicateFunction = (value: any) => any;
type PredicateMap = { [key: string]: PredicateFunction };

const same = (v: any) => v;
const sortNumbers = (a: number, b: number) => a - b;

// Date predicates for granular comparisons (e.g., match by month regardless of day)
// yearMonth uses year*12+month for single comparable value
// "date" strips time for date-only comparison, auto-applied for date fields
const predicates: PredicateMap = {
	month: (v: Date) => v.getMonth(),
	year: (v: Date) => v.getFullYear(),
	yearMonth: (v: Date) => v.getFullYear() * 12 + (v.getMonth() + 1),
	date: (v: Date) => {
		const d = new Date(v);
		d.setHours(0, 0, 0, 0);
		return d.getTime();
	},
};

function orGroup(filters: FilterFunction[]): FilterFunction {
	return v => {
		for (let i = 0; i < filters.length; i++) {
			if (filters[i](v)) {
				return true;
			}
		}
		return false;
	};
}

function andGroup(filters: FilterFunction[]): FilterFunction {
	return v => {
		for (let i = 0; i < filters.length; i++) {
			if (!filters[i](v)) {
				return false;
			}
		}
		return true;
	};
}

const group = {
	or: orGroup,
	and: andGroup,
};

export function createArrayFilter(
	cfg: IFilterSet,
	opts?: FilterOptions,
	fields?: IField[]
): ArrayFilterFunction {
	const f = createFilter(cfg, { orNull: true }, fields);
	if (f === null) {
		return opts && opts.orNull ? null : a => a;
	} else {
		return a => a.filter(f);
	}
}

export function createFilter(
	cfg: IFilterSet,
	opts?: FilterOptions,
	fields?: IField[]
): FilterFunction {
	let filters: any[] = [];

	if (cfg && cfg.rules) {
		cfg.rules.forEach(rule => {
			// Duck-type: 'rules' property distinguishes IFilterSet from IFilter
			if ((rule as IFilterSet).rules) {
				filters.push(
					createFilter(rule as IFilterSet, undefined, fields)
				);
			} else {
				const filter = rule as IFilter;
				if (filter.field === "*" && fields) {
					filters.push(createAnyFieldFilter(filter, fields));
				} else {
					filters.push(createFilterBlock(filter));
				}
			}
		});

		filters = filters.filter(a => a !== null);
	}

	if (!filters.length) {
		return opts && opts.orNull ? null : () => true;
	}

	// Default glue is "and" per query spec
	return group[cfg.glue || "and"](filters);
}

// Convert date strings to Date objects using local time (not UTC)
function coerceDateValue(value: any, type: string | undefined): any {
	if (type !== "date" || value instanceof Date) return value;
	if (typeof value === "string") {
		const date = parseDate(value);
		if (date) return date;
	}
	if (typeof value === "object" && value !== null && "start" in value) {
		return {
			start: coerceDateValue(value.start, type),
			end: coerceDateValue(value.end, type),
		};
	}
	return value;
}

function createFilterBlock(cfg: IFilter): FilterFunction {
	// Auto-apply "date" predicate for date fields to strip time component
	const predicateKey = cfg.predicate || (cfg.type === "date" ? "date" : null);
	const pd = predicates[predicateKey] || same;
	// Full dates (YYYY-MM-DD) need Date conversion, then apply predicate for consistent comparison
	const rawValue = cfg.predicate
		? cfg.value
		: coerceDateValue(cfg.value, cfg.type);
	const filterValue = rawValue instanceof Date ? pd(rawValue) : rawValue;

	if (cfg.includes && cfg.includes.length) {
		// TODO: optimize with Set for large includes arrays
		const coercedIncludes = cfg.includes.map(v => {
			const raw = coerceDateValue(v, cfg.type);
			return raw instanceof Date ? pd(raw) : raw;
		});
		return (value: any) => {
			return coercedIncludes.includes(pd(value[cfg.field]));
		};
	} else if (cfg.filter) {
		const check = getFilter(cfg.filter, cfg.type).handler;
		return (value: any) => {
			return check(pd(value[cfg.field]), filterValue);
		};
	}

	return null;
}

// Wildcard field "*" expansion for #tag and free text per query spec
function createAnyFieldFilter(cfg: IFilter, fields: IField[]): FilterFunction {
	// contains/notContains restricted to text fields
	const targetFields = fields.filter(f => {
		if (cfg.filter === "contains" || cfg.filter === "notContains") {
			return f.type === "text" || !f.type;
		}
		return true;
	});

	const fieldFilters = targetFields
		.map(f => createFilterBlock({ ...cfg, field: f.id, type: f.type }))
		.filter(f => f !== null);

	if (!fieldFilters.length) return null;

	// De Morgan: negative filters need AND (all fields must not match)
	const isNegative =
		cfg.filter === "notEqual" || cfg.filter === "notContains";
	return isNegative ? andGroup(fieldFilters) : orGroup(fieldFilters);
}

export function createFilterRule(
	fields: IField[],
	filter: TFilterType,
	value: string
): IFilterSet {
	if (!value) return null;
	const rules: IFilter[] = fields.map(field => {
		return {
			field: field.id,
			type: field.type || "text",
			filter,
			value,
		};
	});

	return {
		glue: "or",
		rules,
	};
}

export function getOptions(
	data: IDataHash<any>[],
	field: string,
	cfg?: LocatorConfig
) {
	const o: Set<any> = new Set();
	const out: any[] = [];
	const locator = cfg && cfg.predicate ? predicates[cfg.predicate] : same;

	data.forEach(item => {
		const v = locator(item[field]);
		// 0 is valid, null/undefined/empty are not
		if (v || v === 0) {
			if (!o.has(v)) {
				o.add(v);
				out.push(v);
			}
		}
	});

	// Numeric comparator for numbers/dates avoids string coercion (e.g., "10" < "2")
	if (!cfg || cfg.sort !== false) {
		let sort;

		if (cfg)
			sort =
				cfg.sort ||
				(cfg.type === "date" || cfg.type === "number"
					? sortNumbers
					: null);
		else if (out.length) {
			if (typeof out[0] === "number" || out[0] instanceof Date)
				sort = sortNumbers;
		}

		if (typeof sort === "function") out.sort(sort);
		else out.sort();
	}

	return out;
}

// Lazy evaluation via getters - options computed only when field is accessed
export function getOptionsMap(
	data: IDataHash<any>[],
	cfg?: Partial<IField>[]
): OptionsMap {
	const out = {};
	if (!cfg && !data.length) return out;

	if (!cfg) {
		cfg = [];
		for (const key in data[0]) {
			cfg.push({ id: key });
		}
	}

	cfg.forEach(field => {
		Object.defineProperty(out, field.id, {
			get: () => getOptions(data, field.id.toString(), field),
		});
	});

	return out;
}
