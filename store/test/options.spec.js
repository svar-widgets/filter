import { expect, describe, test } from "vitest";
import { getOptions, getOptionsMap } from "../src/index";
import { listData, options } from "./stubs/data";

describe("getOptions, getOptionsMap", () => {
	test("can get unique field options", () => {
		let result = getOptions(listData, "first_name");
		expect(result).to.deep.equal(options.first_name);

		result = getOptions(listData, "age");
		expect(result).to.deep.equal(options.age);

		result = getOptions(listData, "start");
		expect(result[0]).to.be.instanceof(Date);
		expect(result.map(d => d.getTime())).to.deep.equal(
			options.start.map(d => d.getTime())
		);
	});

	test("can removes duplicated values from field options", () => {
		const dataWithDuplicates = [
			{ first_name: "Alex", age: 25 },
			{ first_name: "Alex", age: 25 },
			{ first_name: "John", age: 30 },
			{ first_name: "Alex", age: 25 },
		];

		const nameOptions = getOptions(dataWithDuplicates, "first_name");
		expect(nameOptions).to.deep.equal(["Alex", "John"]);

		const ageOptions = getOptions(dataWithDuplicates, "age");
		expect(ageOptions).to.deep.equal([25, 30]);
	});

	test("can get unique field options with 'year' predicates", () => {
		const result = getOptions(listData, "start", { predicate: "year" });
		expect(result).to.deep.equal([2024, 2025]);
	});

	test("can get unique field options with 'month' predicates", () => {
		const result = getOptions(listData, "start", { predicate: "month" });
		expect(result).to.deep.equal([0, 1, 11, 2, 9]);
	});

	test("can get options map for all fields", () => {
		const optionsMap = getOptionsMap(listData);

		expect(optionsMap.first_name).to.deep.equal(options.first_name);
		expect(optionsMap.age).to.deep.equal(options.age);
		expect(optionsMap.start[0]).to.be.instanceof(Date);
		expect(
			optionsMap.start.map(d => d.getTime()).sort((a, b) => a - b)
		).to.deep.equal(
			options.start.map(d => d.getTime()).sort((a, b) => a - b)
		);
	});

	test("can get options map with specific field config", () => {
		const fields = [
			{ id: "first_name" },
			{ id: "age", sort: (a, b) => b - a },
			{ id: "start", predicate: "year" },
		];

		const optionsMap = getOptionsMap(listData, fields);

		expect(optionsMap.first_name).to.deep.equal(options.first_name);
		expect(optionsMap.age).to.deep.equal(options.age.reverse());
		expect(optionsMap.start).to.deep.equal([2024, 2025]);
	});
});
