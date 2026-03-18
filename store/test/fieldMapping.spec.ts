import { describe, it, expect } from "vitest";
import {
	sanitizeLabel,
	prepareFields,
	buildFieldMaps,
	idsToLabels,
	labelsToIds,
} from "../src/fieldMapping";
import type { IField } from "../src/types";

describe("sanitizeLabel", () => {
	it("should remove whitespace", () => {
		expect(sanitizeLabel("First Name")).toBe("FirstName");
	});

	it("should remove all parser-special characters", () => {
		expect(sanitizeLabel("a:b,c\"d'e(f)g#h-i*j>k<l=m.n")).toBe(
			"abcdefghijklmn"
		);
	});

	it("should keep alphanumeric characters", () => {
		expect(sanitizeLabel("Field123")).toBe("Field123");
	});

	it("should return empty string for all-special input", () => {
		expect(sanitizeLabel(": - #")).toBe("");
	});
});

describe("prepareFields", () => {
	it("should sanitize labels in returned fields", () => {
		const fields: IField[] = [
			{ id: "start", label: "Start Date", type: "date" },
		];
		const result = prepareFields(fields);
		expect(result[0].label).toBe("StartDate");
		expect(result[0].id).toBe("start");
	});

	it("should not mutate original fields", () => {
		const fields: IField[] = [
			{ id: "start", label: "Start Date", type: "date" },
		];
		prepareFields(fields);
		expect(fields[0].label).toBe("Start Date");
	});
});

describe("buildFieldMaps", () => {
	it("should map id to label and label to id", () => {
		const fields: IField[] = [
			{ id: "first_name", label: "FirstName", type: "text" },
		];
		const maps = buildFieldMaps(fields);
		expect(maps.idToLabel.get("first_name")).toBe("FirstName");
		expect(maps.labelToId.get("firstname")).toBe("first_name");
	});

	it("should skip fields where label exactly equals id", () => {
		const fields: IField[] = [
			{ id: "status", label: "status", type: "text" },
		];
		const maps = buildFieldMaps(fields);
		expect(maps.idToLabel.size).toBe(0);
		expect(maps.labelToId.size).toBe(0);
	});

	it("should include fields where label differs from id only by case", () => {
		const fields: IField[] = [
			{ id: "age", label: "Age", type: "number" },
			{ id: "country", label: "Country", type: "text" },
		];
		const maps = buildFieldMaps(fields);
		expect(maps.idToLabel.get("age")).toBe("Age");
		expect(maps.idToLabel.get("country")).toBe("Country");
		expect(maps.labelToId.get("age")).toBe("age");
		expect(maps.labelToId.get("country")).toBe("country");
	});

	it("should skip label that collides with a different field id", () => {
		const fields: IField[] = [
			{ id: "Name", label: "Name", type: "text" },
			{ id: "status", label: "Name", type: "text" },
		];
		const maps = buildFieldMaps(fields);
		// "status" label "Name" collides with field "Name" id
		expect(maps.idToLabel.has("status")).toBe(false);
	});
});

describe("idsToLabels", () => {
	const fields: IField[] = [
		{ id: "first_name", label: "FirstName", type: "text" },
		{ id: "age", label: "Age", type: "number" },
		{ id: "start", label: "StartDate", type: "date" },
	];
	const maps = buildFieldMaps(fields);

	it("should convert field ids to labels", () => {
		expect(idsToLabels("first_name: Alex", maps)).toBe("FirstName: Alex");
	});

	it("should convert case-only differences", () => {
		expect(idsToLabels("age: 44", maps)).toBe("Age: 44");
	});

	it("should convert multiple fields", () => {
		expect(idsToLabels("first_name: Alex and age: >30", maps)).toBe(
			"FirstName: Alex and Age: >30"
		);
	});

	it("should handle compound fields", () => {
		expect(idsToLabels("start.year: 2024", maps)).toBe(
			"StartDate.year: 2024"
		);
	});

	it("should not touch values that look like field ids", () => {
		expect(idsToLabels("first_name: age", maps)).toBe("FirstName: age");
	});

	it("should return unchanged query when no fields match", () => {
		expect(idsToLabels("unknown: value", maps)).toBe("unknown: value");
	});

	it("should return empty string for empty input", () => {
		expect(idsToLabels("", maps)).toBe("");
	});
});

describe("labelsToIds", () => {
	const fields: IField[] = [
		{ id: "first_name", label: "FirstName", type: "text" },
		{ id: "age", label: "Age", type: "number" },
		{ id: "start", label: "StartDate", type: "date" },
	];
	const maps = buildFieldMaps(fields);

	it("should convert labels to field ids", () => {
		expect(labelsToIds("FirstName: Alex", maps)).toBe("first_name: Alex");
	});

	it("should convert case-only differences", () => {
		expect(labelsToIds("Age: 44", maps)).toBe("age: 44");
	});

	it("should handle compound fields", () => {
		expect(labelsToIds("StartDate.year: 2024", maps)).toBe(
			"start.year: 2024"
		);
	});

	it("should be case-insensitive on label lookup", () => {
		expect(labelsToIds("firstname: Alex", maps)).toBe("first_name: Alex");
		expect(labelsToIds("FIRSTNAME: Alex", maps)).toBe("first_name: Alex");
	});

	it("should roundtrip with idsToLabels", () => {
		const original = "first_name: Alex and age: >30 and start.year: 2024";
		const withLabels = idsToLabels(original, maps);
		const backToIds = labelsToIds(withLabels, maps);
		expect(backToIds).toBe(original);
	});
});
