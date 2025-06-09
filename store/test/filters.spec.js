import { expect, it } from "vitest";
import { createArrayFilter } from "../src/index";
import { listData } from "./stubs/filters";

it("filter by includes rule", () => {
	let result;

	result = createArrayFilter({
		rules: [
			{
				field: "first_name",
				includes: ["Alex"],
			},
		],
	})(listData);
	expect(result.length).to.eq(2);
	result = createArrayFilter({
		rules: [
			{
				field: "first_name",
				includes: ["Alex", "Agata"],
			},
		],
	})(listData);
	expect(result.length).to.eq(3);
});

it("filter by conditions", () => {
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
	expect(result.length).to.eq(3);

	result = createArrayFilter({
		rules: [
			{
				field: "first_name",
				filter: "beginsWith",
				value: "D",
			},
		],
	})(listData);
	expect(result.length).to.eq(1);
});

it("and/or filters", () => {
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
	expect(result.length).to.eq(1);

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
	expect(result.length).to.eq(4);
});

it("nested filters", () => {
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
						value: 45,
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
	expect(result.length).to.eq(2);
});
