// Converts IFilterSet/IFilter back to query string syntax (reverse of parser).
// See specs/query-format.md
//
// Predicates: yearMonth stored as year*12+month, converted back to "YYYY-MM".
// Quoting: reserved words (and/or/contains/etc) and special chars are quoted.

import type { IFilterSet, IFilter, TFilterType, AnyData } from "./types";
import { formatDate } from "./dates";

export interface SerializeResult {
	query: string;
	warnings: string[];
}

const RESERVED_WORDS = new Set(["and", "or", "contains", "starts", "ends"]);

const SPECIAL_CHARS = /[:,"()#\-*><.=\s]/;

// Convert yearMonth number (year*12+month) back to YYYY-MM string
function yearMonthToString(value: number): string {
	const year = Math.floor((value - 1) / 12);
	const month = ((value - 1) % 12) + 1;
	return `${year}-${String(month).padStart(2, "0")}`;
}

function quoteValue(value: AnyData): string {
	if (value instanceof Date) {
		return formatDate(value);
	}

	const str = String(value);

	if (typeof value === "number") {
		return str;
	}

	if (RESERVED_WORDS.has(str.toLowerCase())) {
		return `"${str}"`;
	}

	if (SPECIAL_CHARS.test(str)) {
		return `"${str.replace(/"/g, '\\"')}"`;
	}

	return str;
}

function isFilterSet(node: IFilterSet | IFilter): node is IFilterSet {
	return "rules" in node && Array.isArray(node.rules);
}

function serializeNode(
	node: IFilterSet | IFilter,
	warnings: string[],
	needsParens: boolean
): string {
	if (!node) return "";

	if (isFilterSet(node)) {
		return serializeFilterSet(node, warnings, needsParens);
	}

	return serializeFilter(node, warnings);
}

function serializeFilterSet(
	filterSet: IFilterSet,
	warnings: string[],
	needsParens: boolean
): string {
	const { rules, glue = "and" } = filterSet;

	if (!rules || rules.length === 0) {
		return "";
	}

	if (rules.length === 1) {
		return serializeNode(rules[0], warnings, needsParens);
	}

	const parts = rules
		.map(rule => serializeNode(rule, warnings, true))
		.filter(Boolean);

	if (parts.length === 0) {
		return "";
	}

	if (parts.length === 1) {
		return parts[0];
	}

	const joined = parts.join(` ${glue} `);

	if (needsParens) {
		return `(${joined})`;
	}

	return joined;
}

function serializeFilter(filter: IFilter, warnings: string[]): string {
	const {
		field,
		filter: filterType,
		value,
		includes,
		type,
		predicate,
	} = filter;

	if (type === "tuple") {
		warnings.push(
			`Tuple type on field "${field}" cannot be expressed in query syntax`
		);
	}

	if (field === null || field === undefined) {
		if (includes && includes.length > 0) {
			return includes.map(v => `#${quoteValue(v)}`).join(" ");
		}
		if (value !== undefined) {
			return `#${quoteValue(value)}`;
		}
		return "";
	}

	// Construct field identifier with predicate
	// For year/yearMonth with inferrable values, omit predicate for cleaner output
	// e.g., "start: 2024" instead of "start.year: 2024"
	let fieldId: string;
	let useRawValue = false; // Skip quoting for date-like values
	let displayValue = value; // Value to display (may be converted)

	if (predicate === "yearMonth") {
		// yearMonth stored as year*12+month, convert back to YYYY-MM
		fieldId = String(field);
		useRawValue = true; // Don't quote YYYY-MM format
		if (typeof value === "number") {
			displayValue = yearMonthToString(value);
		}
	} else if (
		predicate === "year" &&
		typeof value === "number" &&
		value >= 1000 &&
		value <= 9999
	) {
		// 4-digit year can be inferred, no need for predicate suffix
		fieldId = String(field);
	} else if (predicate) {
		// Other predicates need explicit suffix (e.g., month)
		fieldId = `${field}.${predicate}`;
	} else {
		fieldId = String(field);
	}

	if (includes && includes.length > 0) {
		const values = includes
			.map(v => {
				if (predicate === "yearMonth" && typeof v === "number") {
					return yearMonthToString(v);
				}
				return useRawValue ? String(v) : quoteValue(v);
			})
			.join(", ");
		return `${fieldId}: ${values}`;
	}

	if (filterType) {
		return serializeFilterType(
			fieldId,
			filterType,
			displayValue,
			warnings,
			useRawValue
		);
	}

	if (displayValue !== undefined) {
		return `${fieldId}: ${useRawValue ? String(displayValue) : quoteValue(displayValue)}`;
	}

	return "";
}

function formatValue(value: AnyData | undefined): string {
	if (value === undefined || value === null) return "";
	if (value instanceof Date) {
		return formatDate(value);
	}
	if (typeof value === "number") {
		return String(value);
	}
	return quoteValue(value);
}

function serializeFilterType(
	field: string,
	filterType: TFilterType,
	value: AnyData | undefined,
	warnings: string[],
	useRawValue = false
): string {
	const fmt = (v: AnyData | undefined) =>
		useRawValue ? String(v) : formatValue(v);
	const quote = (v: AnyData) => (useRawValue ? String(v) : quoteValue(v));

	switch (filterType) {
		case "equal":
			return `${field}: ${quote(value!)}`;

		case "notEqual":
			return `${field}: -${quote(value!)}`;

		case "greater":
			return `${field}: >${fmt(value)}`;

		case "greaterOrEqual":
			return `${field}: >=${fmt(value)}`;

		case "less":
			return `${field}: <${fmt(value)}`;

		case "lessOrEqual":
			return `${field}: <=${fmt(value)}`;

		case "contains":
			return `${field}: contains ${quote(value!)}`;

		case "beginsWith":
			return `${field}: starts ${quote(value!)}`;

		case "endsWith":
			return `${field}: ends ${quote(value!)}`;

		case "between": {
			const rangeValue = value as unknown as {
				start: AnyData;
				end: AnyData;
			};
			if (
				rangeValue &&
				typeof rangeValue === "object" &&
				"start" in rangeValue &&
				"end" in rangeValue
			) {
				return `${field}: ${fmt(rangeValue.start)} .. ${fmt(rangeValue.end)}`;
			}
			return "";
		}

		case "notContains":
			return `${field}: -contains ${quote(value!)}`;

		case "notBeginsWith":
			return `${field}: -starts ${quote(value!)}`;

		case "notEndsWith":
			return `${field}: -ends ${quote(value!)}`;

		case "notBetween": {
			const rangeValue = value as unknown as {
				start: AnyData;
				end: AnyData;
			};
			if (
				rangeValue &&
				typeof rangeValue === "object" &&
				"start" in rangeValue &&
				"end" in rangeValue
			) {
				return `(${field}: <${fmt(rangeValue.start)} or ${field}: >${fmt(rangeValue.end)})`;
			}
			return "";
		}

		default:
			warnings.push(
				`Unknown filter type "${filterType}" on field "${field}"`
			);
			return `${field}: ${quoteValue(value!)}`;
	}
}

export function serialize(filter: IFilterSet | IFilter): SerializeResult {
	const warnings: string[] = [];
	const query = serializeNode(filter, warnings, false);
	return { query, warnings };
}
