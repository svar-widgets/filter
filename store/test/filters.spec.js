import { expect, describe, test } from "vitest";
import { createArrayFilter } from "../src/index";
import { listData } from "./stubs/data";

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
		expect(result.map(r => r.id)).to.deep.equal([1, 2]);

		result = createArrayFilter({
			rules: [
				{
					field: "first_name",
					includes: ["Alex", "Agata"],
				},
			],
		})(listData);
		expect(result.map(r => r.id)).to.deep.equal([1, 2, 3]);
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
		expect(result.map(r => r.id)).to.deep.equal([1, 2, 3]);

		result = createArrayFilter({
			rules: [
				{
					field: "first_name",
					filter: "beginsWith",
					value: "D",
				},
			],
		})(listData);
		expect(result.map(r => r.id)).to.deep.equal([4]);

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
		expect(result.map(r => r.id)).to.deep.equal([1, 5]);

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
		expect(result.map(r => r.id)).to.deep.equal([2, 3]);

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
		expect(result.map(r => r.id)).to.deep.equal([3, 4]);
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
		expect(result.map(r => r.id)).to.deep.equal([2]);

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
		expect(result.map(r => r.id)).to.deep.equal([1, 2, 3, 4]);
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
		expect(result.map(r => r.id)).to.deep.equal([1, 3]);

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
		expect(result.map(r => r.id)).to.deep.equal([1, 2, 3]);

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
		expect(result.map(r => r.id)).to.deep.equal([2, 3, 5]);
	});
});
