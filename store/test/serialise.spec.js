import { expect, describe, test } from "vitest";
import { serialize } from "../src/serialize";
import { parse } from "../src/parse";

describe("serialize", () => {
	describe("basic filters", () => {
		test("simple equality", () => {
			const result = serialize({
				field: "status",
				filter: "equal",
				value: "Open",
			});
			expect(result.query).toBe("status: Open");
			expect(result.warnings).toEqual([]);
		});

		test("value with spaces (quoted)", () => {
			const result = serialize({
				field: "type",
				filter: "equal",
				value: "Bug Report",
			});
			expect(result.query).toBe('type: "Bug Report"');
		});

		test("reserved word value (quoted)", () => {
			const result = serialize({
				field: "keyword",
				filter: "equal",
				value: "and",
			});
			expect(result.query).toBe('keyword: "and"');
		});
	});

	describe("multiple values (includes)", () => {
		test("includes array", () => {
			const result = serialize({
				field: "status",
				includes: ["Open", "Closed"],
			});
			expect(result.query).toBe("status: Open, Closed");
		});

		test("includes with spaces", () => {
			const result = serialize({
				field: "status",
				includes: ["In Progress", "On Hold"],
			});
			expect(result.query).toBe('status: "In Progress", "On Hold"');
		});
	});

	describe("exclusion (notEqual)", () => {
		test("single exclusion", () => {
			const result = serialize({
				field: "status",
				filter: "notEqual",
				value: "Closed",
			});
			expect(result.query).toBe("status: -Closed");
		});

		test("exclusion with quotes", () => {
			const result = serialize({
				field: "status",
				filter: "notEqual",
				value: "On Hold",
			});
			expect(result.query).toBe('status: -"On Hold"');
		});
	});

	describe("text matching", () => {
		test("contains", () => {
			const result = serialize({
				field: "name",
				filter: "contains",
				value: "Alex",
			});
			expect(result.query).toBe("name: contains Alex");
		});

		test("beginsWith (starts)", () => {
			const result = serialize({
				field: "name",
				filter: "beginsWith",
				value: "Alex",
			});
			expect(result.query).toBe("name: starts Alex");
		});

		test("endsWith (ends)", () => {
			const result = serialize({
				field: "name",
				filter: "endsWith",
				value: "Smith",
			});
			expect(result.query).toBe("name: ends Smith");
		});

		test("notContains (-contains)", () => {
			const result = serialize({
				field: "name",
				filter: "notContains",
				value: "spam",
			});
			expect(result.query).toBe("name: -contains spam");
		});

		test("notBeginsWith (-starts)", () => {
			const result = serialize({
				field: "name",
				filter: "notBeginsWith",
				value: "test_",
			});
			expect(result.query).toBe("name: -starts test_");
		});

		test("notEndsWith (-ends)", () => {
			const result = serialize({
				field: "name",
				filter: "notEndsWith",
				value: "_old",
			});
			expect(result.query).toBe("name: -ends _old");
		});
	});

	describe("numeric comparisons", () => {
		test("greater than", () => {
			const result = serialize({
				field: "age",
				filter: "greater",
				value: 25,
			});
			expect(result.query).toBe("age: >25");
		});

		test("greater or equal", () => {
			const result = serialize({
				field: "age",
				filter: "greaterOrEqual",
				value: 25,
			});
			expect(result.query).toBe("age: >=25");
		});

		test("less than", () => {
			const result = serialize({
				field: "age",
				filter: "less",
				value: 50,
			});
			expect(result.query).toBe("age: <50");
		});

		test("less or equal", () => {
			const result = serialize({
				field: "age",
				filter: "lessOrEqual",
				value: 50,
			});
			expect(result.query).toBe("age: <=50");
		});
	});

	describe("range (between)", () => {
		test("between numeric", () => {
			const result = serialize({
				field: "age",
				filter: "between",
				value: { start: 25, end: 50 },
			});
			expect(result.query).toBe("age: 25 .. 50");
		});

		test("notBetween", () => {
			const result = serialize({
				field: "age",
				filter: "notBetween",
				value: { start: 25, end: 50 },
			});
			expect(result.query).toBe("(age: <25 or age: >50)");
		});
	});

	describe("date values", () => {
		test("date comparison", () => {
			const result = serialize({
				field: "created",
				filter: "lessOrEqual",
				value: new Date("2024-01-01"),
			});
			expect(result.query).toBe("created: <=2024-01-01");
		});

		test("date range", () => {
			const result = serialize({
				field: "created",
				filter: "between",
				value: {
					start: new Date("2024-01-01"),
					end: new Date("2024-12-31"),
				},
			});
			expect(result.query).toBe("created: 2024-01-01 .. 2024-12-31");
		});
	});

	describe("quick search (field: null)", () => {
		test("quick search single value", () => {
			const result = serialize({
				field: null,
				filter: "equal",
				value: "Open",
			});
			expect(result.query).toBe("#Open");
		});

		test("quick search includes", () => {
			const result = serialize({
				field: null,
				includes: ["Open", "Closed"],
			});
			expect(result.query).toBe("#Open #Closed");
		});
	});

	describe("filter sets (AND/OR)", () => {
		test("and combination", () => {
			const result = serialize({
				glue: "and",
				rules: [
					{ field: "status", filter: "equal", value: "Open" },
					{ field: "priority", filter: "equal", value: "High" },
				],
			});
			expect(result.query).toBe("status: Open and priority: High");
		});

		test("or combination", () => {
			const result = serialize({
				glue: "or",
				rules: [
					{ field: "status", filter: "equal", value: "Open" },
					{ field: "status", filter: "equal", value: "Closed" },
				],
			});
			expect(result.query).toBe("status: Open or status: Closed");
		});

		test("nested groups", () => {
			const result = serialize({
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
			expect(result.query).toBe(
				"project: Alpha and (status: Open or status: Closed)"
			);
		});
	});

	describe("predicates", () => {
		test("month predicate serialisation (explicit)", () => {
			const result = serialize({
				field: "date",
				filter: "equal",
				value: 6,
				predicate: "month",
			});
			expect(result.warnings.length).toBe(0);
			// Month predicate must be explicit (not inferrable from value)
			expect(result.query).toBe("date.month: 6");
		});

		test("year predicate serialisation (clean output)", () => {
			const result = serialize({
				field: "start",
				filter: "equal",
				value: 2024,
				predicate: "year",
			});
			expect(result.warnings.length).toBe(0);
			// Year predicate omitted for cleaner output (4-digit year is inferrable)
			expect(result.query).toBe("start: 2024");
		});

		test("yearMonth predicate serialisation (clean output)", () => {
			// yearMonth stored as year*12+month: 2024*12+1 = 24289
			const result = serialize({
				field: "start",
				filter: "equal",
				value: 2024 * 12 + 1,
				predicate: "yearMonth",
			});
			expect(result.warnings.length).toBe(0);
			// yearMonth predicate omitted for cleaner output (YYYY-MM is inferrable)
			expect(result.query).toBe("start: 2024-01");
		});

		test("year predicate with comparison", () => {
			const result = serialize({
				field: "start",
				filter: "greater",
				value: 2020,
				predicate: "year",
			});
			expect(result.warnings.length).toBe(0);
			expect(result.query).toBe("start: >2020");
		});

		test("yearMonth predicate with comparison", () => {
			// yearMonth stored as year*12+month: 2024*12+6 = 24294
			const result = serialize({
				field: "start",
				filter: "greaterOrEqual",
				value: 2024 * 12 + 6,
				predicate: "yearMonth",
			});
			expect(result.warnings.length).toBe(0);
			expect(result.query).toBe("start: >=2024-06");
		});
	});

	describe("warnings", () => {
		test("tuple type warning", () => {
			const result = serialize({
				field: "range",
				filter: "equal",
				value: [1, 2],
				type: "tuple",
			});
			expect(result.warnings.length).toBe(1);
			expect(result.warnings[0]).toContain("Tuple");
		});

		test("unknown filter type warning", () => {
			const result = serialize({
				field: "test",
				filter: "unknownType",
				value: "value",
			});
			expect(result.warnings.length).toBe(1);
			expect(result.warnings[0]).toContain("Unknown filter type");
		});
	});

	describe("round-trip: serialize then parse", () => {
		test("between numeric round-trip", () => {
			const fields = [{ id: "age", label: "Age", type: "number" }];
			const filter = {
				field: "age",
				filter: "between",
				value: { start: 25, end: 50 },
			};
			const query = serialize(filter).query;
			const parsed = parse(query, fields);
			expect(parsed.isInvalid).toBe(false);
			expect(parsed.config).toEqual({
				field: "age",
				filter: "between",
				value: { start: 25, end: 50 },
				type: "number",
			});
		});

		test("date range round-trip", () => {
			const fields = [{ id: "created", label: "Created", type: "date" }];
			const filter = {
				field: "created",
				filter: "between",
				value: {
					start: new Date("2024-01-01"),
					end: new Date("2024-12-31"),
				},
			};
			const query = serialize(filter).query;
			const parsed = parse(query, fields);
			expect(parsed.isInvalid).toBe(false);
			expect(parsed.config).toEqual({
				field: "created",
				filter: "between",
				value: { start: "2024-01-01", end: "2024-12-31" },
				type: "date",
			});
		});
	});

	describe("empty/edge cases", () => {
		test("empty rules array", () => {
			const result = serialize({ rules: [] });
			expect(result.query).toBe("");
		});

		test("single rule in rules array", () => {
			const result = serialize({
				rules: [{ field: "status", filter: "equal", value: "Open" }],
			});
			expect(result.query).toBe("status: Open");
		});

		test("null filter", () => {
			const result = serialize(null);
			expect(result.query).toBe("");
		});
	});
});
