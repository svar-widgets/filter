import { expect, describe, test } from "vitest";
import { parse } from "../src/parse";

function getTokenTypes(result) {
	return result.tokens.map(t => t.type);
}

function getTokenRanges(result, text) {
	return result.tokens.map(t => ({
		type: t.type,
		text: text.slice(t.start, t.end),
		...(t.invalid && { invalid: true }),
	}));
}

describe("parse", () => {
	describe("basic field-value pairs", () => {
		test("simple field: value", () => {
			const result = parse("status: Open");
			expect(result.isInvalid).toBe(false);
			expect(result.config).toEqual({
				field: "status",
				filter: "equal",
				value: "Open",
			});
		});

		test("quoted value", () => {
			const result = parse('type: "Bug Report"');
			expect(result.isInvalid).toBe(false);
			expect(result.config).toEqual({
				field: "type",
				filter: "equal",
				value: "Bug Report",
			});
		});

		test("multi-word unquoted value", () => {
			const result = parse("type: Support Request");
			expect(result.isInvalid).toBe(false);
			expect(result.config).toEqual({
				field: "type",
				filter: "equal",
				value: "Support Request",
			});
		});
	});

	describe("multiple values", () => {
		test("comma-separated values", () => {
			const result = parse("status: Open, Closed");
			expect(result.isInvalid).toBe(false);
			expect(result.config).toEqual({
				field: "status",
				includes: ["Open", "Closed"],
			});
		});

		test("multiple quoted values", () => {
			const result = parse('status: "In Progress", "On Hold"');
			expect(result.isInvalid).toBe(false);
			expect(result.config).toEqual({
				field: "status",
				includes: ["In Progress", "On Hold"],
			});
		});
	});

	describe("exclusion", () => {
		test("single exclusion", () => {
			const result = parse("status: -Closed");
			expect(result.isInvalid).toBe(false);
			expect(result.config).toEqual({
				field: "status",
				filter: "notEqual",
				value: "Closed",
			});
		});

		test("multiple exclusions", () => {
			const result = parse('status: -Closed, -"On Hold"');
			expect(result.isInvalid).toBe(false);
			expect(result.config).toEqual({
				glue: "and",
				rules: [
					{ field: "status", filter: "notEqual", value: "Closed" },
					{ field: "status", filter: "notEqual", value: "On Hold" },
				],
			});
		});
	});

	describe("wildcards", () => {
		test("starts with", () => {
			const result = parse("name: Alex*");
			expect(result.isInvalid).toBe(false);
			expect(result.config).toEqual({
				field: "name",
				filter: "beginsWith",
				value: "Alex",
			});
		});

		test("ends with", () => {
			const result = parse("email: *@gmail.com");
			expect(result.isInvalid).toBe(false);
			expect(result.config).toEqual({
				field: "email",
				filter: "endsWith",
				value: "@gmail.com",
			});
		});

		test("contains", () => {
			const result = parse("title: *urgent*");
			expect(result.isInvalid).toBe(false);
			expect(result.config).toEqual({
				field: "title",
				filter: "contains",
				value: "urgent",
			});
		});
	});

	describe("text operators", () => {
		test("contains keyword", () => {
			const result = parse("name: contains Alex");
			expect(result.isInvalid).toBe(false);
			expect(result.config).toEqual({
				field: "name",
				filter: "contains",
				value: "Alex",
			});
		});

		test("starts keyword", () => {
			const result = parse("name: starts Alex");
			expect(result.isInvalid).toBe(false);
			expect(result.config).toEqual({
				field: "name",
				filter: "beginsWith",
				value: "Alex",
			});
		});

		test("ends keyword", () => {
			const result = parse("name: ends Smith");
			expect(result.isInvalid).toBe(false);
			expect(result.config).toEqual({
				field: "name",
				filter: "endsWith",
				value: "Smith",
			});
		});

		test("-contains (notContains)", () => {
			const result = parse("name: -contains spam");
			expect(result.isInvalid).toBe(false);
			expect(result.config).toEqual({
				field: "name",
				filter: "notContains",
				value: "spam",
			});
		});

		test("-starts (notBeginsWith)", () => {
			const result = parse("name: -starts test_");
			expect(result.isInvalid).toBe(false);
			expect(result.config).toEqual({
				field: "name",
				filter: "notBeginsWith",
				value: "test_",
			});
		});

		test("-ends (notEndsWith)", () => {
			const result = parse("email: -ends @temp.com");
			expect(result.isInvalid).toBe(false);
			expect(result.config).toEqual({
				field: "email",
				filter: "notEndsWith",
				value: "@temp.com",
			});
		});

		test("list-level starts applies to all values with OR", () => {
			const result = parse("name: starts A, B");
			expect(result.isInvalid).toBe(false);
			expect(result.config).toEqual({
				glue: "or",
				rules: [
					{ field: "name", filter: "beginsWith", value: "A" },
					{ field: "name", filter: "beginsWith", value: "B" },
				],
			});
		});

		test("list-level contains applies to all values with OR", () => {
			const result = parse("name: contains foo, bar");
			expect(result.isInvalid).toBe(false);
			expect(result.config).toEqual({
				glue: "or",
				rules: [
					{ field: "name", filter: "contains", value: "foo" },
					{ field: "name", filter: "contains", value: "bar" },
				],
			});
		});

		test("list-level operator with negated value uses AND", () => {
			const result = parse("name: starts A, -B");
			expect(result.isInvalid).toBe(false);
			expect(result.config).toEqual({
				glue: "and",
				rules: [
					{ field: "name", filter: "beginsWith", value: "A" },
					{ field: "name", filter: "notBeginsWith", value: "B" },
				],
			});
		});

		test("list-level operator with all negated values uses AND", () => {
			const result = parse("name: starts -A, -B");
			expect(result.isInvalid).toBe(false);
			expect(result.config).toEqual({
				glue: "and",
				rules: [
					{ field: "name", filter: "notBeginsWith", value: "A" },
					{ field: "name", filter: "notBeginsWith", value: "B" },
				],
			});
		});
	});

	describe("numeric comparisons", () => {
		const fields = [{ id: "age", label: "Age", type: "number" }];

		test("greater than", () => {
			const result = parse("age: >25", fields);
			expect(result.isInvalid).toBe(false);
			expect(result.config).toEqual({
				field: "age",
				filter: "greater",
				value: 25,
				type: "number",
			});
		});

		test("greater or equal", () => {
			const result = parse("age: >=25", fields);
			expect(result.isInvalid).toBe(false);
			expect(result.config).toEqual({
				field: "age",
				filter: "greaterOrEqual",
				value: 25,
				type: "number",
			});
		});

		test("less than", () => {
			const result = parse("age: <50", fields);
			expect(result.isInvalid).toBe(false);
			expect(result.config).toEqual({
				field: "age",
				filter: "less",
				value: 50,
				type: "number",
			});
		});

		test("less or equal", () => {
			const result = parse("age: <=50", fields);
			expect(result.isInvalid).toBe(false);
			expect(result.config).toEqual({
				field: "age",
				filter: "lessOrEqual",
				value: 50,
				type: "number",
			});
		});

		test("negative numbers", () => {
			const result = parse("age: >-10", fields);
			expect(result.isInvalid).toBe(false);
			expect(result.config).toEqual({
				field: "age",
				filter: "greater",
				value: -10,
				type: "number",
			});
		});
	});

	describe("range", () => {
		const fields = [{ id: "age", label: "Age", type: "number" }];

		test("numeric range", () => {
			const result = parse("age: 25 .. 50", fields);
			expect(result.isInvalid).toBe(false);
			expect(result.config).toEqual({
				field: "age",
				filter: "between",
				value: { start: 25, end: 50 },
				type: "number",
			});
		});
	});

	describe("date fields", () => {
		const fields = [{ id: "created", label: "Created", type: "date" }];

		test("date comparison", () => {
			const result = parse("created: <=2024-01-01", fields);
			expect(result.isInvalid).toBe(false);
			expect(result.config).toEqual({
				field: "created",
				filter: "lessOrEqual",
				value: "2024-01-01",
				type: "date",
			});
		});

		test("date range", () => {
			const result = parse("created: 2024-01-01 .. 2024-12-31", fields);
			expect(result.isInvalid).toBe(false);
			expect(result.config).toEqual({
				field: "created",
				filter: "between",
				value: { start: "2024-01-01", end: "2024-12-31" },
				type: "date",
			});
		});

		test("invalid date format", () => {
			const result = parse("created: invalid-date", fields);
			expect(result.isInvalid).toBeTruthy();
		});
	});

	describe("logical operators", () => {
		test("and operator", () => {
			const result = parse("status: Open and priority: High");
			expect(result.isInvalid).toBe(false);
			expect(result.config).toEqual({
				glue: "and",
				rules: [
					{ field: "status", filter: "equal", value: "Open" },
					{ field: "priority", filter: "equal", value: "High" },
				],
			});
		});

		test("or operator", () => {
			const result = parse("status: Open or status: Closed");
			expect(result.isInvalid).toBe(false);
			expect(result.config).toEqual({
				glue: "or",
				rules: [
					{ field: "status", filter: "equal", value: "Open" },
					{ field: "status", filter: "equal", value: "Closed" },
				],
			});
		});

		test("implicit and (space-separated)", () => {
			const result = parse("status: Open priority: High");
			expect(result.isInvalid).toBe(false);
			expect(result.config).toEqual({
				glue: "and",
				rules: [
					{ field: "status", filter: "equal", value: "Open" },
					{ field: "priority", filter: "equal", value: "High" },
				],
			});
		});

		test("parentheses grouping", () => {
			const result = parse(
				"project: Alpha and (status: Open or status: Closed)"
			);
			expect(result.isInvalid).toBe(false);
			expect(result.config).toEqual({
				glue: "and",
				rules: [
					{ field: "project", filter: "equal", value: "Alpha" },
					{
						glue: "or",
						rules: [
							{ field: "status", filter: "equal", value: "Open" },
							{
								field: "status",
								filter: "equal",
								value: "Closed",
							},
						],
					},
				],
			});
		});
	});

	describe("quick search (tags)", () => {
		test("hash search", () => {
			const result = parse("#Open");
			expect(result.isInvalid).toBe(false);
			expect(result.config).toEqual({
				field: "*",
				filter: "equal",
				value: "Open",
			});
		});

		test("hash with quoted value", () => {
			const result = parse('#"In Progress"');
			expect(result.isInvalid).toBe(false);
			expect(result.config).toEqual({
				field: "*",
				filter: "equal",
				value: "In Progress",
			});
		});

		test("negated hash search", () => {
			const result = parse("-#Open");
			expect(result.isInvalid).toBe(false);
			expect(result.config).toEqual({
				field: "*",
				filter: "notEqual",
				value: "Open",
			});
		});

		test("multiple tags", () => {
			const result = parse("#bug, feature");
			expect(result.isInvalid).toBe(false);
			expect(result.config).toEqual({
				field: "*",
				includes: ["bug", "feature"],
			});
		});

		test("tag with exclusion", () => {
			const result = parse("#Open, -Closed");
			expect(result.isInvalid).toBe(false);
			expect(result.config).toEqual({
				glue: "and",
				rules: [
					{ field: "*", filter: "equal", value: "Open" },
					{ field: "*", filter: "notEqual", value: "Closed" },
				],
			});
		});

		test("negated tag with multiple values", () => {
			const result = parse("-#Open, Closed");
			expect(result.isInvalid).toBe(false);
			expect(result.config).toEqual({
				glue: "and",
				rules: [
					{ field: "*", filter: "notEqual", value: "Open" },
					{ field: "*", filter: "notEqual", value: "Closed" },
				],
			});
		});

		test("multiple hash searches with and", () => {
			const result = parse("#bug and #urgent");
			expect(result.isInvalid).toBe(false);
			expect(result.config).toEqual({
				glue: "and",
				rules: [
					{ field: "*", filter: "equal", value: "bug" },
					{ field: "*", filter: "equal", value: "urgent" },
				],
			});
		});

		test("tag combined with field:value", () => {
			const result = parse("status: Open and #urgent");
			expect(result.isInvalid).toBe(false);
			expect(result.config).toEqual({
				glue: "and",
				rules: [
					{ field: "status", filter: "equal", value: "Open" },
					{ field: "*", filter: "equal", value: "urgent" },
				],
			});
		});
	});

	describe("startOperation", () => {
		test("extracts start operation character", () => {
			const result = parse("# status: Open");
			expect(result.startOperation).toBe("#");
			expect(result.config).toEqual({
				field: "status",
				filter: "equal",
				value: "Open",
			});
		});

		test("no startOperation for #value (quick search)", () => {
			const result = parse("#Open");
			expect(result.startOperation).toBe(null);
		});
	});

	describe("field validation", () => {
		const fields = [
			{ id: "status", label: "Status", type: "text" },
			{ id: "age", label: "Age", type: "number" },
		];

		test("valid field", () => {
			const result = parse("status: Open", fields);
			expect(result.isInvalid).toBe(false);
		});

		test("unknown field", () => {
			const result = parse("unknown: value", fields);
			expect(result.isInvalid).toBeTruthy();
			expect(result.isInvalid.code).toBe("UNKNOWN_FIELD");
			expect(result.isInvalid.field).toBe("unknown");
		});
	});

	describe("options validation", () => {
		const fields = [
			{ id: "status", label: "Status", type: "text" },
			{ id: "age", label: "Age", type: "number" },
			{ id: "name", label: "Name", type: "text" },
		];
		const options = {
			status: ["Open", "Closed", "In Progress"],
			age: [18, 21, 30, 65],
			name: ["John", "Jane", "Bob"],
		};

		test("valid option value", () => {
			const result = parse("status: Open", fields, options);
			expect(result.isInvalid).toBe(false);
		});

		test("invalid option value", () => {
			const result = parse("status: Invalid", fields, options);
			expect(result.isInvalid).toBeTruthy();
			expect(result.isInvalid.code).toBe("NO_DATA");
		});

		test("comparison > skips options validation", () => {
			const result = parse("age: >2", fields, options);
			expect(result.isInvalid).toBe(false);
			expect(result.config.filter).toBe("greater");
		});

		test("comparison >= skips options validation", () => {
			const result = parse("age: >=5", fields, options);
			expect(result.isInvalid).toBe(false);
			expect(result.config.filter).toBe("greaterOrEqual");
		});

		test("comparison < skips options validation", () => {
			const result = parse("age: <100", fields, options);
			expect(result.isInvalid).toBe(false);
			expect(result.config.filter).toBe("less");
		});

		test("comparison <= skips options validation", () => {
			const result = parse("age: <=99", fields, options);
			expect(result.isInvalid).toBe(false);
			expect(result.config.filter).toBe("lessOrEqual");
		});

		test("range skips options validation", () => {
			const result = parse("age: 2..100", fields, options);
			expect(result.isInvalid).toBe(false);
			expect(result.config.filter).toBe("between");
			expect(result.config.value).toEqual({ start: 2, end: 100 });
		});

		test("wildcard suffix skips options validation", () => {
			const result = parse("name: Jo*", fields, options);
			expect(result.isInvalid).toBe(false);
			expect(result.config.filter).toBe("beginsWith");
		});

		test("wildcard prefix skips options validation", () => {
			const result = parse("name: *ohn", fields, options);
			expect(result.isInvalid).toBe(false);
			expect(result.config.filter).toBe("endsWith");
		});

		test("wildcard both skips options validation", () => {
			const result = parse("name: *oh*", fields, options);
			expect(result.isInvalid).toBe(false);
			expect(result.config.filter).toBe("contains");
		});

		test("contains operator skips options validation", () => {
			const result = parse("name: contains xyz", fields, options);
			expect(result.isInvalid).toBe(false);
			expect(result.config.filter).toBe("contains");
		});

		test("starts operator skips options validation", () => {
			const result = parse("name: starts X", fields, options);
			expect(result.isInvalid).toBe(false);
			expect(result.config.filter).toBe("beginsWith");
		});

		test("ends operator skips options validation", () => {
			const result = parse("name: ends xyz", fields, options);
			expect(result.isInvalid).toBe(false);
			expect(result.config.filter).toBe("endsWith");
		});

		test("negated value still validates against options", () => {
			const result = parse("name: -Unknown", fields, options);
			expect(result.isInvalid).toBeTruthy();
			expect(result.isInvalid.code).toBe("NO_DATA");
		});

		test("negated value in options is valid", () => {
			const result = parse("name: -John", fields, options);
			expect(result.isInvalid).toBe(false);
			expect(result.config.filter).toBe("notEqual");
		});

		test("exact match not in options returns error", () => {
			const result = parse("age: 25", fields, options);
			expect(result.isInvalid).toBeTruthy();
			expect(result.isInvalid.code).toBe("NO_DATA");
			expect(result.isInvalid.field).toBe("age");
			expect(result.isInvalid.value).toBe("25");
		});

		test("exact match in options is valid", () => {
			const result = parse("age: 21", fields, options);
			expect(result.isInvalid).toBe(false);
		});
	});

	describe("options validation with format function", () => {
		const months = { 1: "Jan", 2: "Feb", 3: "Mar" };
		const fields = [
			{
				id: "month",
				label: "Month",
				type: "tuple",
				format: v => months[v] || String(v),
			},
		];
		const options = { month: [1, 2, 3, 4, 5] };

		test("formatted label is accepted as valid value", () => {
			const result = parse("month: Jan", fields, options);
			expect(result.isInvalid).toBe(false);
		});

		test("formatted label resolves to raw option value", () => {
			const result = parse("month: Jan", fields, options);
			expect(result.config.value).toBe(1);
		});

		test("unformatted raw value is also accepted", () => {
			const result = parse("month: 4", fields, options);
			expect(result.isInvalid).toBe(false);
		});

		test("unknown formatted value returns NO_DATA error", () => {
			const result = parse("month: April", fields, options);
			expect(result.isInvalid).toBeTruthy();
			expect(result.isInvalid.code).toBe("NO_DATA");
		});

		test("multiple formatted values resolve correctly", () => {
			const result = parse("month: Jan, Feb", fields, options);
			expect(result.isInvalid).toBe(false);
			expect(result.config.includes).toEqual([1, 2]);
		});
	});

	describe("empty input", () => {
		test("empty string", () => {
			const result = parse("");
			expect(result.isInvalid).toBe(false);
			expect(result.config).toEqual({ rules: [] });
		});

		test("whitespace only", () => {
			const result = parse("   ");
			expect(result.isInvalid).toBe(false);
			expect(result.config).toEqual({ rules: [] });
		});

		test("null/undefined", () => {
			const result = parse(null);
			expect(result.isInvalid).toBe(false);
			expect(result.config).toEqual({ rules: [] });
		});
	});

	describe("highlight tokens", () => {
		test("simple field: value returns field, symbol, value tokens", () => {
			const text = "status: Open";
			const result = parse(text);
			const ranges = getTokenRanges(result, text);
			expect(ranges).toEqual([
				{ type: "field", text: "status" },
				{ type: "symbol", text: ":" },
				{ type: "value", text: "Open" },
			]);
		});

		test("quoted value", () => {
			const text = 'type: "Bug Report"';
			const result = parse(text);
			const ranges = getTokenRanges(result, text);
			expect(ranges).toEqual([
				{ type: "field", text: "type" },
				{ type: "symbol", text: ":" },
				{ type: "value", text: '"Bug Report"' },
			]);
		});

		test("multiple values with comma", () => {
			const text = "status: Open, Closed";
			const result = parse(text);
			const ranges = getTokenRanges(result, text);
			expect(ranges).toEqual([
				{ type: "field", text: "status" },
				{ type: "symbol", text: ":" },
				{ type: "value", text: "Open" },
				{ type: "symbol", text: "," },
				{ type: "value", text: "Closed" },
			]);
		});

		test("exclusion with minus", () => {
			const text = "status: -Closed";
			const result = parse(text);
			const ranges = getTokenRanges(result, text);
			expect(ranges).toEqual([
				{ type: "field", text: "status" },
				{ type: "symbol", text: ":" },
				{ type: "negation", text: "-" },
				{ type: "value", text: "Closed" },
			]);
		});

		test("comparison operator", () => {
			const text = "age: >=25";
			const fields = [{ id: "age", label: "Age", type: "number" }];
			const result = parse(text, fields);
			const ranges = getTokenRanges(result, text);
			expect(ranges).toEqual([
				{ type: "field", text: "age" },
				{ type: "symbol", text: ":" },
				{ type: "comparison", text: ">=" },
				{ type: "value", text: "25" },
			]);
		});

		test("text operator", () => {
			const text = "name: contains Alex";
			const result = parse(text);
			const ranges = getTokenRanges(result, text);
			expect(ranges).toEqual([
				{ type: "field", text: "name" },
				{ type: "symbol", text: ":" },
				{ type: "textop", text: "contains" },
				{ type: "value", text: "Alex" },
			]);
		});

		test("negated text operator", () => {
			const text = "name: -contains spam";
			const result = parse(text);
			const ranges = getTokenRanges(result, text);
			expect(ranges).toEqual([
				{ type: "field", text: "name" },
				{ type: "symbol", text: ":" },
				{ type: "negation", text: "-" },
				{ type: "textop", text: "contains" },
				{ type: "value", text: "spam" },
			]);
		});

		test("wildcards", () => {
			const text = "name: *Alex*";
			const result = parse(text);
			const ranges = getTokenRanges(result, text);
			expect(ranges).toEqual([
				{ type: "field", text: "name" },
				{ type: "symbol", text: ":" },
				{ type: "wildcard", text: "*" },
				{ type: "value", text: "Alex" },
				{ type: "wildcard", text: "*" },
			]);
		});

		test("range with ..", () => {
			const text = "age: 25 .. 50";
			const fields = [{ id: "age", label: "Age", type: "number" }];
			const result = parse(text, fields);
			const ranges = getTokenRanges(result, text);
			expect(ranges).toEqual([
				{ type: "field", text: "age" },
				{ type: "symbol", text: ":" },
				{ type: "value", text: "25" },
				{ type: "symbol", text: ".." },
				{ type: "value", text: "50" },
			]);
		});

		test("logical operators", () => {
			const text = "status: Open and priority: High";
			const result = parse(text);
			const ranges = getTokenRanges(result, text);
			expect(ranges).toEqual([
				{ type: "field", text: "status" },
				{ type: "symbol", text: ":" },
				{ type: "value", text: "Open" },
				{ type: "operator", text: "and" },
				{ type: "field", text: "priority" },
				{ type: "symbol", text: ":" },
				{ type: "value", text: "High" },
			]);
		});

		test("or operator", () => {
			const text = "status: Open or status: Closed";
			const result = parse(text);
			const ranges = getTokenRanges(result, text);
			expect(ranges).toEqual([
				{ type: "field", text: "status" },
				{ type: "symbol", text: ":" },
				{ type: "value", text: "Open" },
				{ type: "operator", text: "or" },
				{ type: "field", text: "status" },
				{ type: "symbol", text: ":" },
				{ type: "value", text: "Closed" },
			]);
		});

		test("parentheses", () => {
			const text = "(status: Open or status: Closed)";
			const result = parse(text);
			const ranges = getTokenRanges(result, text);
			expect(ranges).toEqual([
				{ type: "symbol", text: "(" },
				{ type: "field", text: "status" },
				{ type: "symbol", text: ":" },
				{ type: "value", text: "Open" },
				{ type: "operator", text: "or" },
				{ type: "field", text: "status" },
				{ type: "symbol", text: ":" },
				{ type: "value", text: "Closed" },
				{ type: "symbol", text: ")" },
			]);
		});

		test("quick search with hash", () => {
			const text = "#Open";
			const result = parse(text);
			const ranges = getTokenRanges(result, text);
			expect(ranges).toEqual([
				{ type: "hash", text: "#" },
				{ type: "value", text: "Open" },
			]);
		});

		test("startOperation token", () => {
			const text = "# status: Open";
			const result = parse(text);
			expect(result.startOperation).toBe("#");
			const ranges = getTokenRanges(result, text);
			expect(ranges).toEqual([
				{ type: "symbol", text: "#" },
				{ type: "field", text: "status" },
				{ type: "symbol", text: ":" },
				{ type: "value", text: "Open" },
			]);
		});

		test("complex query tokens", () => {
			const text = "project: Alpha and (status: Open or priority: -Low)";
			const result = parse(text);
			const types = getTokenTypes(result);
			expect(types).toEqual([
				"field",
				"symbol",
				"value",
				"operator",
				"symbol",
				"field",
				"symbol",
				"value",
				"operator",
				"field",
				"symbol",
				"negation",
				"value",
				"symbol",
			]);
		});

		test("unknown field emits field token with invalid flag", () => {
			const fields = [{ id: "status", label: "Status", type: "text" }];
			const text = "unknown: value";
			const result = parse(text, fields);
			expect(result.isInvalid).toBeTruthy();
			const ranges = getTokenRanges(result, text);
			expect(ranges[0]).toEqual({
				type: "field",
				text: "unknown",
				invalid: true,
			});
		});

		test("preserves correct positions with leading whitespace", () => {
			const text = "  status: Open";
			const result = parse(text);
			const ranges = getTokenRanges(result, text);
			expect(ranges).toEqual([
				{ type: "field", text: "status" },
				{ type: "symbol", text: ":" },
				{ type: "value", text: "Open" },
			]);
		});
	});

	describe("naturalText", () => {
		const fields = [
			{ id: "status", label: "Status", type: "text" },
			{ id: "age", label: "Age", type: "number" },
		];

		test("returns null for valid field:value query", () => {
			const result = parse("status: Open", fields);
			expect(result.naturalText).toBe(null);
		});

		test("returns null for hash search", () => {
			const result = parse("#Open", fields);
			expect(result.naturalText).toBe(null);
		});

		test("returns text for unknown field", () => {
			const result = parse("unknown: value", fields);
			expect(result.naturalText).toBe("unknown: value");
		});

		test("returns text for single word without colon", () => {
			const result = parse("hello", fields);
			expect(result.naturalText).toBe("hello");
		});

		test("returns text for multiple words without colon", () => {
			const result = parse("some text here", fields);
			expect(result.naturalText).toBe("some text here");
		});

		test("returns text for words with comma but no colon", () => {
			const result = parse("age,12", fields);
			expect(result.naturalText).toBe("age,12");
		});

		test("returns trimmed text", () => {
			const result = parse("  hello world  ", fields);
			expect(result.naturalText).toBe("hello world");
		});

		test("returns null for empty input", () => {
			const result = parse("", fields);
			expect(result.naturalText).toBe(null);
		});

		test("returns null for complex valid query", () => {
			const result = parse("status: Open and age: >25", fields);
			expect(result.naturalText).toBe(null);
		});

		test("returns null when no fields defined (all fields valid)", () => {
			const result = parse("anything: value");
			expect(result.naturalText).toBe(null);
		});
	});

	describe("allowFreeText option", () => {
		const fields = [
			{ id: "status", label: "Status", type: "text" },
			{ id: "name", label: "Name", type: "text" },
		];

		test("single word creates contains filter", () => {
			const result = parse("hello", fields, {}, { allowFreeText: true });
			expect(result.isInvalid).toBe(false);
			expect(result.naturalText).toBe("hello");
			expect(result.config).toEqual({
				field: "*",
				filter: "contains",
				value: "hello",
			});
		});

		test("multiple words creates AND of contains filters", () => {
			const result = parse(
				"hello world",
				fields,
				{},
				{ allowFreeText: true }
			);
			expect(result.isInvalid).toBe(false);
			expect(result.config).toEqual({
				glue: "and",
				rules: [
					{ field: "*", filter: "contains", value: "hello" },
					{ field: "*", filter: "contains", value: "world" },
				],
			});
		});

		test("negated word creates notContains filter", () => {
			const result = parse("-spam", fields, {}, { allowFreeText: true });
			expect(result.isInvalid).toBe(false);
			expect(result.config).toEqual({
				field: "*",
				filter: "notContains",
				value: "spam",
			});
		});

		test("mixed positive and negated words", () => {
			const result = parse(
				"hello -spam",
				fields,
				{},
				{ allowFreeText: true }
			);
			expect(result.isInvalid).toBe(false);
			expect(result.config).toEqual({
				glue: "and",
				rules: [
					{ field: "*", filter: "contains", value: "hello" },
					{ field: "*", filter: "notContains", value: "spam" },
				],
			});
		});

		test("without allowFreeText, natural text is invalid", () => {
			const result = parse("hello world", fields);
			expect(result.isInvalid).toBeTruthy();
			expect(result.naturalText).toBe("hello world");
		});

		test("valid field:value query is not affected by allowFreeText", () => {
			const result = parse(
				"status: Open",
				fields,
				{},
				{ allowFreeText: true }
			);
			expect(result.isInvalid).toBe(false);
			expect(result.naturalText).toBe(null);
			expect(result.config).toEqual({
				field: "status",
				filter: "equal",
				value: "Open",
			});
		});

		test("hash search is not affected by allowFreeText", () => {
			const result = parse(
				"#urgent",
				fields,
				{},
				{ allowFreeText: true }
			);
			expect(result.isInvalid).toBe(false);
			expect(result.naturalText).toBe(null);
			expect(result.config).toEqual({
				field: "*",
				filter: "equal",
				value: "urgent",
			});
		});

		test("empty negation is filtered out", () => {
			const result = parse(
				"hello -",
				fields,
				{},
				{ allowFreeText: true }
			);
			expect(result.isInvalid).toBe(false);
			expect(result.config).toEqual({
				field: "*",
				filter: "contains",
				value: "hello",
			});
		});
	});

	describe("predicates", () => {
		const fields = [
			{ id: "start", label: "Start", type: "date" },
			{ id: "end", label: "End", type: "date" },
			{ id: "name", label: "Name", type: "text" },
		];

		test("year predicate on date field", () => {
			const result = parse("start.year: 2024", fields);
			expect(result.isInvalid).toBe(false);
			expect(result.config).toEqual({
				field: "start",
				predicate: "year",
				filter: "equal",
				value: 2024,
				type: "date",
			});
		});

		test("month predicate on date field", () => {
			const result = parse("start.month: 6", fields);
			expect(result.isInvalid).toBe(false);
			expect(result.config).toEqual({
				field: "start",
				predicate: "month",
				filter: "equal",
				value: 6,
				type: "date",
			});
		});

		test("predicate with comparison operator", () => {
			const result = parse("start.year: >2020", fields);
			expect(result.isInvalid).toBe(false);
			expect(result.config).toEqual({
				field: "start",
				predicate: "year",
				filter: "greater",
				value: 2020,
				type: "date",
			});
		});

		test("predicate with range", () => {
			const result = parse("start.month: 1 .. 6", fields);
			expect(result.isInvalid).toBe(false);
			expect(result.config).toEqual({
				field: "start",
				predicate: "month",
				filter: "between",
				value: { start: 1, end: 6 },
				type: "date",
			});
		});

		test("predicate on non-date field is treated as literal", () => {
			const result = parse("name.year: 2024", fields);
			// name.year is not a date field, so it should be treated as unknown field
			expect(result.isInvalid.code).toBe("UNKNOWN_FIELD");
		});

		test("unknown predicate is treated as literal field name", () => {
			const result = parse("start.day: 15", fields);
			// start.day is not a valid predicate, treat as literal field name
			expect(result.isInvalid.code).toBe("UNKNOWN_FIELD");
		});

		test("multiple values with predicate", () => {
			const result = parse("start.year: 2023, 2024", fields);
			expect(result.isInvalid).toBe(false);
			expect(result.config).toEqual({
				field: "start",
				predicate: "year",
				includes: [2023, 2024],
				type: "date",
			});
		});

		test("predicate with negation", () => {
			const result = parse("start.year: -2024", fields);
			expect(result.isInvalid).toBe(false);
			expect(result.config).toEqual({
				field: "start",
				predicate: "year",
				filter: "notEqual",
				value: 2024,
				type: "date",
			});
		});

		test("auto-infer year predicate from YYYY value", () => {
			const result = parse("start: 2024", fields);
			expect(result.isInvalid).toBe(false);
			expect(result.config).toEqual({
				field: "start",
				predicate: "year",
				filter: "equal",
				value: 2024,
				type: "date",
			});
		});

		test("auto-infer yearMonth predicate from YYYY-MM value", () => {
			const result = parse("start: 2024-01", fields);
			expect(result.isInvalid).toBe(false);
			// yearMonth stored as year*12+month: 2024*12+1 = 24289
			expect(result.config).toEqual({
				field: "start",
				predicate: "yearMonth",
				filter: "equal",
				value: 2024 * 12 + 1,
				type: "date",
			});
		});

		test("auto-infer year predicate with comparison operator", () => {
			const result = parse("start: >2020", fields);
			expect(result.isInvalid).toBe(false);
			expect(result.config).toEqual({
				field: "start",
				predicate: "year",
				filter: "greater",
				value: 2020,
				type: "date",
			});
		});

		test("auto-infer yearMonth predicate with comparison operator", () => {
			const result = parse("start: >=2024-06", fields);
			expect(result.isInvalid).toBe(false);
			// yearMonth stored as year*12+month: 2024*12+6 = 24294
			expect(result.config).toEqual({
				field: "start",
				predicate: "yearMonth",
				filter: "greaterOrEqual",
				value: 2024 * 12 + 6,
				type: "date",
			});
		});

		test("full date does not auto-infer predicate", () => {
			const result = parse("start: 2024-01-15", fields);
			expect(result.isInvalid).toBe(false);
			expect(result.config).toEqual({
				field: "start",
				filter: "equal",
				value: "2024-01-15",
				type: "date",
			});
			// No predicate for full dates
			expect(result.config.predicate).toBeUndefined();
		});
	});
});
