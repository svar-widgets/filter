import type {
	IFilter,
	IFilterSet,
	IDataHash,
	IField,
	TFilterType,
} from "./types";
import { getFilter } from "./filters";

export type ArrayFilterFunction = (value: any[]) => any[];

export type LocatorConfig = {
	predicate?: string;
	sort?: boolean;
	type?: string;
};
export type OptionsMap = { [key: string]: any[] };
export type FilterFunction = (value: any) => boolean;

export interface FilterOptions {
	orNull?: boolean;
}

type PredicateFunction = (value: any) => any;
type PredicateMap = { [key: string]: PredicateFunction };

const same = (v: any) => v;
const sortNumbers = (a: number, b: number) => a - b;

const predicates: PredicateMap = {
	month: (v: Date) => v.getMonth(),
	year: (v: Date) => v.getFullYear(),
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
	opts?: FilterOptions
): ArrayFilterFunction {
	const f = createFilter(cfg, { orNull: true });
	if (f === null) {
		return opts && opts.orNull ? null : a => a;
	} else {
		return a => a.filter(f);
	}
}

export function createFilter(
	cfg: IFilterSet,
	opts?: FilterOptions
): FilterFunction {
	let filters: any[] = [];

	if (cfg && cfg.rules) {
		cfg.rules.forEach(rule => {
			if ((rule as IFilterSet).rules) {
				filters.push(createFilter(rule as IFilterSet));
			} else {
				filters.push(createFilterBlock(rule as IFilter));
			}
		});

		filters = filters.filter(a => a !== null);
	}

	if (!filters.length) {
		return opts && opts.orNull ? null : () => true;
	}

	return group[cfg.glue || "and"](filters);
}

function createFilterBlock(cfg: IFilter): FilterFunction {
	const pd = predicates[cfg.predicate] || same;
	if (cfg.includes && cfg.includes.length) {
		// filter by list of values
		return (value: any) => {
			// FIXME - we can optimize this by using hashmap
			return cfg.includes.includes(pd(value[cfg.field]));
		};
	} else if (cfg.filter) {
		// filter by condition
		const check = getFilter(cfg.filter, cfg.type).handler;
		return (value: any) => {
			return check(pd(value[cfg.field]), cfg.value);
		};
	}

	return null;
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
		if (v || v === 0) {
			if (!o.has(v)) {
				o.add(v);
				out.push(v);
			}
		}
	});

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
