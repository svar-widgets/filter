export const NumberFilters = "number";
export const TextFilters = "text";
export const DateFilters = "date";
export const TupleFilters = "tuple";

const filters = [
	{
		id: "greater",
		label: "greater",
		short: ">",
		type: [NumberFilters, DateFilters, TupleFilters],
		handler: (a, b) => a > b,
	},
	{
		id: "less",
		label: "less",
		short: "<",
		type: [NumberFilters, DateFilters, TupleFilters],
		handler: (a, b) => a < b,
	},
	{
		id: "greaterOrEqual",
		label: "greater or equal",
		short: ">=",
		type: [NumberFilters, DateFilters, TupleFilters],
		handler: (a, b) => a >= b,
	},
	{
		id: "lessOrEqual",
		label: "less or equal",
		short: "<=",
		type: [NumberFilters, DateFilters, TupleFilters],
		handler: (a, b) => a <= b,
	},

	{
		id: "equal",
		label: "equal",
		short: "=",
		type: [NumberFilters, TupleFilters],
		handler: (a, b) => a == b,
	},
	{
		id: "equal",
		label: "equal",
		short: "=",
		type: [TextFilters],
		handler: (a, b) => a.toLowerCase() === b.toLowerCase(),
	},
	{
		id: "equal",
		label: "equal",
		short: "=",
		default: true,
		type: [DateFilters],
		handler: (a, b) => {
			if (!a || !b) return false;
			return a.valueOf() === b.valueOf();
		},
	},

	{
		id: "notEqual",
		label: "not equal",
		short: "!=",
		type: [NumberFilters, TupleFilters],
		handler: (a, b) => a != b,
	},
	{
		id: "notEqual",
		label: "not equal",
		short: "!=",
		type: [TextFilters],
		handler: (a, b) => a.toLowerCase() !== b.toLowerCase(),
	},
	{
		id: "notEqual",
		label: "not equal",
		short: "!=",
		type: [DateFilters],
		handler: (a, b) => {
			if (!a || !b) return true;
			return a.valueOf() !== b.valueOf();
		},
	},

	{
		id: "contains",
		label: "contains",
		default: true,
		type: [NumberFilters, TextFilters],
		handler: (a, b) =>
			a.toString().toLowerCase().indexOf(b.toString().toLowerCase()) !==
			-1,
	},
	{
		id: "notContains",
		label: "not contains",
		type: [NumberFilters, TextFilters],
		handler: (a, b) =>
			a.toString().toLowerCase().indexOf(b.toString().toLowerCase()) ===
			-1,
	},

	{
		id: "beginsWith",
		label: "begins with",
		type: [NumberFilters, TextFilters],
		handler: (a, b) => {
			a = a.toString().toLowerCase();
			b = b.toString().toLowerCase();
			return a.lastIndexOf(b, 0) === 0;
		},
	},
	{
		id: "notBeginsWith",
		label: "not begins with",
		type: [NumberFilters, TextFilters],
		handler: (a, b) => {
			a = a.toString().toLowerCase();
			b = b.toString().toLowerCase();
			return a.lastIndexOf(b, 0) !== 0;
		},
	},
	{
		id: "endsWith",
		label: "ends with",
		type: [NumberFilters, TextFilters],
		handler: (a, b) => {
			a = a.toString().toLowerCase();
			b = b.toString().toLowerCase();
			return a.indexOf(b, a.length - b.length) !== -1;
		},
	},
	{
		id: "notEndsWith",
		label: "not ends with",
		type: [NumberFilters, TextFilters],
		handler: (a, b) => {
			a = a.toString().toLowerCase();
			b = b.toString().toLowerCase();
			return a.indexOf(b, a.length - b.length) === -1;
		},
	},

	{
		id: "between",
		label: "between",
		range: true,
		type: [DateFilters],
		handler: (a, b) => (!b.start || a > b.start) && (!b.end || a < b.end),
	},
	{
		id: "notBetween",
		label: "not between",
		range: true,
		type: [DateFilters],
		handler: (a, b) => !b.start || a <= b.start || !b.end || a >= b.end,
	},
];

export const getFilters = type => {
	if (typeof type === "undefined") return filters;
	return filters.filter(a => a.type.indexOf(type) !== -1);
};

export const getFilter = (id, type) => {
	type = type || TextFilters;
	let matches = filters.filter(f => f.id === id);
	if (matches.length > 1)
		matches = matches.filter(f => f.type.indexOf(type) !== -1);
	return matches[0];
};
