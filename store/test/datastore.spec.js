/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable vitest/valid-expect */
import { expect, it } from "vitest";
import { DataStore } from "../src/index";
import { getFilterA1, fields } from "./stubs/filters";

function getDataStore(value) {
	const store = new DataStore();
	store.init({
		fields,
		value,
	});
	const root = store.getState().value.getBranch(0)[0];
	return { store, root };
}

it("supports add action", () => {
	const { store, root } = getDataStore(getFilterA1());
	const value = store.getState().value;

	expect(value.getBranch(root.id).length).to.eq(3);

	store.in.exec("add-rule", { rule: { id: "x1" } });

	expect(value.getBranch(root.id).length).to.eq(4);
	const newOne = value.getBranch(root.id)[3];
	expect(newOne.field).to.eq("first_name");
});

it("delete nested rules", () => {
	const { store, root } = getDataStore(getFilterA1());
	const value = store.getState().value;

	const br2 = root.data[2].id;
	const kids = value.getBranch(br2).map(a => a.id);
	expect(kids.length).to.eq(2);

	store.in.exec("delete-rule", { id: kids[1] });
	expect(value.getBranch(br2).length).to.eq(1);
	store.in.exec("delete-rule", { id: kids[0] });
	expect(value.byId(br2)).to.be.not.ok;
});
