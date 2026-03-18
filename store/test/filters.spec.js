import { expect, describe, test } from "vitest";
import { createArrayFilter } from "../src/index";
import { listData, fields } from "./stubs/data";

// Data with multiple dates in the same month to test day-level precision
const dateData = [
	{ id: 1, date: new Date(2023, 7, 10) }, // Aug 10
	{ id: 2, date: new Date(2023, 7, 20) }, // Aug 20
	{ id: 3, date: new Date(2023, 7, 28) }, // Aug 28
	{ id: 4, date: new Date(2023, 7, 30) }, // Aug 30
	{ id: 5, date: new Date(2023, 8, 5) }, //  Sep 5
	{ id: 6, date: new Date(2023, 6, 15) }, // Jul 15
];

const textData = [
	{ id: 1, name: "Alexander" },
	{ id: 2, name: "Bob" },
	{ id: 3, name: "alex" },
	{ id: 4, name: null },
	{ id: 5 }, // missing property (undefined)
];

describe("text filters", () => {
	test("equal - case insensitive match", () => {
		const result = createArrayFilter({
			rules: [{ field: "name", filter: "equal", value: "alexander" }],
		})(textData);
		expect(result.map(r => r.id)).toEqual([1]);
	});

	test("equal - no match for null/undefined", () => {
		const result = createArrayFilter({
			rules: [{ field: "name", filter: "equal", value: "Bob" }],
		})(textData);
		expect(result.map(r => r.id)).toEqual([2]);
	});

	test("notEqual - includes null/undefined", () => {
		const result = createArrayFilter({
			rules: [{ field: "name", filter: "notEqual", value: "Bob" }],
		})(textData);
		expect(result.map(r => r.id)).toEqual([1, 3, 4, 5]);
	});

	test("contains - case insensitive", () => {
		const result = createArrayFilter({
			rules: [{ field: "name", filter: "contains", value: "alex" }],
		})(textData);
		expect(result.map(r => r.id)).toEqual([1, 3]);
	});

	test("contains - no match for null/undefined", () => {
		const result = createArrayFilter({
			rules: [{ field: "name", filter: "contains", value: "ob" }],
		})(textData);
		expect(result.map(r => r.id)).toEqual([2]);
	});

	test("notContains - includes null/undefined", () => {
		const result = createArrayFilter({
			rules: [{ field: "name", filter: "notContains", value: "alex" }],
		})(textData);
		expect(result.map(r => r.id)).toEqual([2, 4, 5]);
	});

	test("beginsWith - case insensitive", () => {
		const result = createArrayFilter({
			rules: [{ field: "name", filter: "beginsWith", value: "al" }],
		})(textData);
		expect(result.map(r => r.id)).toEqual([1, 3]);
	});

	test("beginsWith - no match for null/undefined", () => {
		const result = createArrayFilter({
			rules: [{ field: "name", filter: "beginsWith", value: "bo" }],
		})(textData);
		expect(result.map(r => r.id)).toEqual([2]);
	});

	test("notBeginsWith - includes null/undefined", () => {
		const result = createArrayFilter({
			rules: [{ field: "name", filter: "notBeginsWith", value: "al" }],
		})(textData);
		expect(result.map(r => r.id)).toEqual([2, 4, 5]);
	});

	test("endsWith - case insensitive", () => {
		const result = createArrayFilter({
			rules: [{ field: "name", filter: "endsWith", value: "ER" }],
		})(textData);
		expect(result.map(r => r.id)).toEqual([1]);
	});

	test("endsWith - no match for null/undefined", () => {
		const result = createArrayFilter({
			rules: [{ field: "name", filter: "endsWith", value: "ob" }],
		})(textData);
		expect(result.map(r => r.id)).toEqual([2]);
	});

	test("notEndsWith - includes null/undefined", () => {
		const result = createArrayFilter({
			rules: [{ field: "name", filter: "notEndsWith", value: "er" }],
		})(textData);
		expect(result.map(r => r.id)).toEqual([2, 3, 4, 5]);
	});
});

describe("filtering", () => {
	test("filter by includes rule", () => {
		let result;

		result = createArrayFilter({
			rules: [
				{
					field: "first_name",
					includes: ["Alex"],
				},
			],
		})(listData);
		expect(result.map(r => r.id)).toEqual([1, 2]);

		result = createArrayFilter({
			rules: [
				{
					field: "first_name",
					includes: ["Alex", "Agata"],
				},
			],
		})(listData);
		expect(result.map(r => r.id)).toEqual([1, 2, 3]);
	});

	test("filter by conditions", () => {
		let result;

		result = createArrayFilter({
			rules: [
				{
					field: "first_name",
					filter: "beginsWith",
					value: "A",
				},
			],
		})(listData);
		expect(result.map(r => r.id)).toEqual([1, 2, 3]);

		result = createArrayFilter({
			rules: [
				{
					field: "first_name",
					filter: "beginsWith",
					value: "D",
				},
			],
		})(listData);
		expect(result.map(r => r.id)).toEqual([4]);

		result = createArrayFilter({
			rules: [
				{
					field: "age",
					filter: "less",
					type: "number",
					value: 30,
				},
			],
		})(listData);
		expect(result.map(r => r.id)).toEqual([1, 5]);

		result = createArrayFilter({
			rules: [
				{
					field: "start",
					filter: "greater",
					type: "date",
					value: new Date(2025, 1, 1),
				},
			],
		})(listData);
		expect(result.map(r => r.id)).toEqual([2, 3]);

		result = createArrayFilter({
			rules: [
				{
					field: "age",
					filter: "between",
					type: "number",
					value: { start: 30, end: 40 },
				},
			],
		})(listData);
		expect(result.map(r => r.id)).toEqual([3, 4]);
	});

	test("and/or filters", () => {
		let result;

		result = createArrayFilter({
			rules: [
				{
					field: "first_name",
					filter: "beginsWith",
					value: "A",
				},
				{
					field: "age",
					filter: "equal",
					type: "number",
					value: 45,
				},
			],
		})(listData);
		expect(result.map(r => r.id)).toEqual([2]);

		result = createArrayFilter({
			glue: "or",
			rules: [
				{
					field: "first_name",
					filter: "beginsWith",
					value: "A",
				},
				{
					field: "first_name",
					filter: "beginsWith",
					value: "D",
				},
			],
		})(listData);
		expect(result.map(r => r.id)).toEqual([1, 2, 3, 4]);
	});

	test("date filter with string value (greater)", () => {
		// Simulates parsed query: date: > 2023-08-28
		// Should compare full date, not just month
		const result = createArrayFilter({
			rules: [
				{
					field: "date",
					filter: "greater",
					type: "date",
					value: "2023-08-28",
				},
			],
		})(dateData);
		expect(result.map(r => r.id)).toEqual([4, 5]);
	});

	test("date filter with string value (less)", () => {
		// date: < 2023-08-28
		const result = createArrayFilter({
			rules: [
				{
					field: "date",
					filter: "less",
					type: "date",
					value: "2023-08-28",
				},
			],
		})(dateData);
		expect(result.map(r => r.id)).toEqual([1, 2, 6]);
	});

	test("date filter with string value (greaterOrEqual)", () => {
		// date: >= 2023-08-28
		const result = createArrayFilter({
			rules: [
				{
					field: "date",
					filter: "greaterOrEqual",
					type: "date",
					value: "2023-08-28",
				},
			],
		})(dateData);
		expect(result.map(r => r.id)).toEqual([3, 4, 5]);
	});

	test("date filter with string value (lessOrEqual)", () => {
		// date: <= 2023-08-20
		const result = createArrayFilter({
			rules: [
				{
					field: "date",
					filter: "lessOrEqual",
					type: "date",
					value: "2023-08-20",
				},
			],
		})(dateData);
		expect(result.map(r => r.id)).toEqual([1, 2, 6]);
	});

	test("date filter with string value (equal)", () => {
		// date: 2023-08-28 (exact match)
		const result = createArrayFilter({
			rules: [
				{
					field: "date",
					filter: "equal",
					type: "date",
					value: "2023-08-28",
				},
			],
		})(dateData);
		expect(result.map(r => r.id)).toEqual([3]);
	});

	test("date filter with string value (between)", () => {
		// date: 2023-08-15 .. 2023-08-29
		const result = createArrayFilter({
			rules: [
				{
					field: "date",
					filter: "between",
					type: "date",
					value: { start: "2023-08-15", end: "2023-08-29" },
				},
			],
		})(dateData);
		expect(result.map(r => r.id)).toEqual([2, 3]);
	});

	describe("wildcard field (field='*')", () => {
		test("equal - strict match by any field", () => {
			const result = createArrayFilter(
				{
					glue: "and",
					rules: [{ field: "*", filter: "equal", value: "John" }],
				},
				undefined,
				fields
			)(listData);
			expect(result.map(r => r.id)).toEqual([5]);
		});

		test("equal - matches across different text fields", () => {
			const result = createArrayFilter(
				{
					glue: "and",
					rules: [{ field: "*", filter: "equal", value: "Wane" }],
				},
				undefined,
				fields
			)(listData);
			expect(result.map(r => r.id)).toEqual([5, 6]);
		});

		test("equal - no partial match", () => {
			const result = createArrayFilter(
				{
					glue: "and",
					rules: [{ field: "*", filter: "equal", value: "Ale" }],
				},
				undefined,
				fields
			)(listData);
			expect(result.map(r => r.id)).toEqual([]);
		});

		test("contains - restricted to text fields", () => {
			const result = createArrayFilter(
				{
					glue: "and",
					rules: [{ field: "*", filter: "contains", value: "ane" }],
				},
				undefined,
				fields
			)(listData);
			// "Jane" (first_name) and "Wane" (last_name)
			expect(result.map(r => r.id)).toEqual([5, 6]);
		});

		test("notEqual - AND across all fields (De Morgan)", () => {
			const result = createArrayFilter(
				{
					glue: "and",
					rules: [{ field: "*", filter: "notEqual", value: "John" }],
				},
				undefined,
				fields
			)(listData);
			// excludes id:5 (first_name is "John")
			expect(result.map(r => r.id)).toEqual([1, 2, 3, 4, 6]);
		});
	});

	test("nested filters", () => {
		let result;

		result = createArrayFilter({
			rules: [
				{
					field: "first_name",
					filter: "beginsWith",
					value: "A",
				},
				{
					glue: "or",
					rules: [
						{
							field: "age",
							filter: "equal",
							type: "number",
							value: 35,
						},
						{
							field: "age",
							filter: "equal",
							type: "number",
							value: 26,
						},
					],
				},
			],
		})(listData);
		expect(result.map(r => r.id)).toEqual([1, 3]);

		result = createArrayFilter({
			rules: [
				{
					field: "first_name",
					filter: "beginsWith",
					value: "A",
				},
				{
					glue: "or",
					rules: [
						{
							field: "age",
							filter: "greater",
							type: "number",
							value: 30,
						},
						{
							field: "start",
							filter: "less",
							type: "date",
							value: new Date(2025, 0, 31),
						},
					],
				},
			],
		})(listData);
		expect(result.map(r => r.id)).toEqual([1, 2, 3]);

		result = createArrayFilter({
			glue: "or",
			rules: [
				{
					field: "first_name",
					filter: "equal",
					value: "John",
				},
				{
					glue: "and",
					rules: [
						{
							field: "age",
							filter: "greater",
							type: "number",
							value: 30,
						},
						{
							glue: "or",
							rules: [
								{
									field: "last_name",
									filter: "equal",
									value: "Smith",
								},
								{
									field: "start",
									filter: "greater",
									type: "date",
									value: new Date(2025, 1, 1),
								},
							],
						},
					],
				},
			],
		})(listData);
		expect(result.map(r => r.id)).toEqual([2, 3, 5]);
	});
});
