/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable vitest/valid-expect */
import { expect, describe, test } from "vitest";
import { DataStore } from "../src/index";
import { getData, fields } from "./stubs/data";

function getDataStore(data) {
	const store = new DataStore();
	store.init({
		...data,
	});
	const root = store.getState().value.getBranch(0)[0];
	return { store, root };
}

describe("datastore", () => {
	describe("datastore init", () => {
		test("initializes correctly", () => {
			const { store, root } = getDataStore(getData());
			const { value } = store.getState();

			expect(store).to.not.be.undefined;
			expect(value.getBranch(root.id).length).to.eq(3);
		});
	});

	describe("add-rule", () => {
		test("can add rule to empty rule", () => {
			const { store, root } = getDataStore(getData("empty"));
			let { value } = store.getState();

			store.in.exec("add-rule", { rule: { id: "x1" } });

			({ value } = store.getState());
			const rules = value.getBranch(root.id);
			expect(rules.length).to.eq(1);
			const targetRule = rules[0];
			expect(targetRule.field).to.eq("first_name");
			expect(targetRule.filter).to.eq("contains");
			expect(targetRule.type).to.eq("text");
		});

		test("can add rule to existing rule", () => {
			const { store, root } = getDataStore(getData());
			let { value } = store.getState();
			let rules = value.getBranch(root.id);
			expect(rules.length).to.eq(3);

			store.in.exec("add-rule", { rule: { id: "x1" } });

			({ value } = store.getState());
			rules = value.getBranch(root.id);
			expect(rules.length).to.eq(4);
			const targetRule = rules[3];
			expect(targetRule.field).to.eq("first_name");
			expect(targetRule.filter).to.eq("contains");
			expect(targetRule.type).to.eq("text");
		});

		test("can add rule after specific rule", () => {
			const { store, root } = getDataStore(getData());
			let { value } = store.getState();
			let rules = value.getBranch(root.id);
			const after = rules[1].id;

			store.in.exec("add-rule", {
				rule: { id: "x1" },
				after,
			});

			({ value } = store.getState());
			rules = value.getBranch(root.id);
			expect(rules.length).to.eq(4);

			const targetRule = rules[2];
			expect(targetRule.id).to.eq("x1");
			expect(targetRule.field).to.eq("first_name");
			expect(targetRule.filter).to.eq("contains");
			expect(targetRule.type).to.eq("text");
		});

		test("can add rule with edit flag", () => {
			const { store } = getDataStore(getData());

			store.in.exec("add-rule", {
				rule: { id: "x1" },
				edit: true,
			});

			const editor = store.getState()._editor;
			expect(editor.id).to.eq("x1");
		});
	});

	describe("add group", () => {
		test("can add group", () => {
			const { store, root } = getDataStore(getData());
			let { value } = store.getState();
			let rules = value.getBranch(root.id);
			const after = rules[0].id;

			expect(rules.length).to.eq(3);

			store.in.exec("add-group", {
				rule: { id: "x1" },
				after,
			});

			({ value } = store.getState());
			rules = value.getBranch(root.id);
			expect(rules.length).to.eq(4);

			const group = rules[1];
			expect(group.glue).to.eq("and");
			expect(group.parent).to.eq(root.id);
			expect(group.data.length).to.eq(1);
			const groupRule = group.data[0];
			expect(groupRule.id).to.eq("x1");
			expect(groupRule.field).to.eq("first_name");
			expect(groupRule.filter).to.eq("contains");
			expect(groupRule.type).to.eq("text");
		});

		test("can add group in group", () => {
			const { store, root } = getDataStore(getData());
			let { value } = store.getState();
			let rules = value.getBranch(root.id);
			let targetGroup = rules[2];
			const after = targetGroup.data[0].id;

			expect(rules.length).to.eq(3);
			expect(targetGroup.data.length).to.eq(2);

			store.in.exec("add-group", {
				rule: { id: "x1" },
				after,
			});

			({ value } = store.getState());
			rules = value.getBranch(root.id);
			targetGroup = rules[2];
			expect(rules.length).to.eq(3);
			expect(targetGroup.data.length).to.eq(3);

			const group = targetGroup.data[1];
			expect(group.glue).to.eq("and");
			expect(group.parent).to.eq(targetGroup.id);
			expect(group.data.length).to.eq(1);
			const groupRule = group.data[0];
			expect(groupRule.id).to.eq("x1");
			expect(groupRule.field).to.eq("first_name");
			expect(groupRule.filter).to.eq("contains");
			expect(groupRule.type).to.eq("text");
		});
	});

	describe("delete-rule", () => {
		test("can delete rule", () => {
			const { store, root } = getDataStore(getData());
			let { value } = store.getState();
			const rules = value.getBranch(root.id);
			let deleteId = rules[1].id;

			store.in.exec("delete-rule", { id: deleteId });

			({ value } = store.getState());
			expect(value.getBranch(root.id).length).to.eq(2);
			expect(value.byId(deleteId)).to.be.undefined;

			deleteId = rules[0].id;

			store.in.exec("delete-rule", { id: deleteId });

			({ value } = store.getState());
			expect(value.getBranch(root.id).length).to.eq(1);
			expect(value.byId(deleteId)).to.be.undefined;
		});

		test("can delete all rule", () => {
			const { store, root } = getDataStore(getData());
			let { value } = store.getState();
			const rulesIds = value
				.getBranch(root.id)
				.map(a => {
					if (a.data) {
						return a.data.map(b => b.id);
					}
					return a.id;
				})
				.flat();

			rulesIds.forEach(id => {
				store.in.exec("delete-rule", { id });
			});

			({ value } = store.getState());
			expect(value.getBranch(root.id)).to.be.null;
		});
	});

	describe("toggle-glue", () => {
		test("can toggle glues", () => {
			const { store, root } = getDataStore(getData());
			let { value } = store.getState();

			expect(root.glue).to.eq("or");

			store.in.exec("toggle-glue", { id: root.id });

			({ value } = store.getState());
			expect(value.byId(root.id).glue).to.eq("and");

			value = store.getState().value;
			let rules = value.getBranch(root.id);
			let group = rules[2];

			expect(group.glue).to.eq("and");
			store.in.exec("toggle-glue", { id: group.id });

			({ value } = store.getState());
			expect(value.byId(group.id).glue).to.eq("or");
		});
	});

	describe("update-rule", () => {
		test("can update rules", () => {
			const { store, root } = getDataStore(getData());
			let { value } = store.getState();
			let rules = value.getBranch(root.id);
			let target = rules[0];

			store.in.exec("update-rule", {
				id: target.id,
				rule: {
					field: "age",
					filter: "greater",
					value: 30,
					type: "number",
				},
			});

			({ value } = store.getState());
			target = value.byId(target.id);
			expect(target.field).to.eq("age");
			expect(target.filter).to.eq("greater");
			expect(target.value).to.eq(30);
			expect(target.type).to.eq("number");
			expect(target.$temp).to.be.false;

			rules = value.getBranch(root.id);
			target = rules[2].data[0];

			const targetValue = {
				start: new Date(2025, 6, 14),
				end: new Date(2025, 6, 24),
			};
			store.in.exec("update-rule", {
				id: target.id,
				rule: {
					field: "start",
					filter: "between",
					value: targetValue,
					type: "date",
				},
			});

			({ value } = store.getState());
			target = value.byId(target.id);
			expect(target.field).to.eq("start");
			expect(target.filter).to.eq("between");
			expect(target.value.start.getTime()).to.eq(
				targetValue.start.getTime()
			);
			expect(target.value.end.getTime()).to.eq(targetValue.end.getTime());
			expect(target.type).to.eq("date");
			expect(target.$temp).to.be.false;
		});
	});

	describe("normalization functions", () => {
		test("can normalize options", () => {
			const optionsFn = field => options[field];
			const { store } = getDataStore({
				...getData("empty"),
				fields,
				options: optionsFn,
			});

			const { options } = store.getState();
			expect(typeof options).to.eq("function");
			expect(options("first_name")).to.deep.eq(options.first_name);
			expect(options("unknown")).to.be.undefined;
		});

		test("can normalize simple filter value", () => {
			const fields = [
				{ id: "first_name", label: "First Name", type: "text" },
				{ id: "age", label: "Age", type: "number" },
				{
					id: "start",
					label: "Start",
					type: "date",
					predicate: "year",
				},
			];
			const value = {
				rules: [
					{ field: "first_name", value: "Alex" },
					{ field: "age", value: 26 },
					{ field: "start" },
				],
			};

			const { store } = getDataStore(getData("empty"));
			const normalizedValue = store.normalizeValue(value, fields);

			expect(normalizedValue.glue).to.eq("and");
			expect(normalizedValue.rules).to.deep.eq([
				{
					field: "first_name",
					value: "Alex",
					type: "text",
					filter: "contains",
					includes: [],
				},
				{
					field: "age",
					value: 26,
					type: "number",
					includes: [],
					filter: "contains",
				},
				{
					field: "start",
					type: "date",
					filter: "equal",
					includes: [],
					predicate: "year",
				},
			]);
		});

		test("can normalize nested filter value", () => {
			const fields = [
				{ id: "first_name", label: "First Name", type: "text" },
				{ id: "last_name", label: "Last Name", type: "text" },
				{ id: "age", label: "Age", type: "number" },
				{
					id: "start",
					label: "Start",
					type: "date",
					predicate: "year",
				},
			];
			const value = {
				glue: "or",
				rules: [
					{ field: "first_name", includes: ["Alex"] },
					{
						glue: "or",
						rules: [
							{ field: "age", filter: "greater", value: 26 },
							{
								field: "last_name",
								filter: "beginsWith",
								value: "W",
							},
							{ glue: "or", rules: [{ field: "start" }] },
						],
					},
				],
			};

			const { store } = getDataStore(getData("empty"));
			const normalizedValue = store.normalizeValue(value, fields);

			expect(normalizedValue.glue).to.eq("or");
			expect(normalizedValue.rules).to.deep.eq([
				{
					field: "first_name",
					type: "text",
					filter: "contains",
					includes: ["Alex"],
				},
				{
					glue: "or",
					rules: [
						{
							field: "age",
							value: 26,
							type: "number",
							includes: [],
							filter: "greater",
						},
						{
							field: "last_name",
							value: "W",
							type: "text",
							includes: [],
							filter: "beginsWith",
						},
						{
							glue: "or",
							rules: [
								{
									field: "start",
									type: "date",
									includes: [],
									filter: "equal",
									predicate: "year",
								},
							],
						},
					],
				},
			]);
		});
	});
});
