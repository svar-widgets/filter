import { describe, it, expect } from "vitest";
import { getAutocompleteContext, getSuggestions } from "../src/autocomplete";
import type { IField } from "../src/types";

describe("getAutocompleteContext", () => {
	describe("field context", () => {
		it("should return field context at start of input", () => {
			const ctx = getAutocompleteContext("a", 1);
			expect(ctx).toEqual({
				type: "field",
				text: "a",
				field: null,
				start: 0,
				end: 1,
			});
		});

		it("should return field context after space", () => {
			const ctx = getAutocompleteContext("first_name: Alex cou", 20);
			expect(ctx).toEqual({
				type: "field",
				text: "cou",
				field: null,
				start: 17,
				end: 20,
			});
		});

		it("should return field context after logical operator", () => {
			const ctx = getAutocompleteContext("age: 30 and na", 14);
			expect(ctx).toEqual({
				type: "field",
				text: "na",
				field: null,
				start: 12,
				end: 14,
			});
		});
	});

	describe("value context", () => {
		it("should return value context after colon", () => {
			const ctx = getAutocompleteContext("first_name: A", 13);
			expect(ctx).toEqual({
				type: "value",
				text: "A",
				field: "first_name",
				start: 12,
				end: 13,
			});
		});

		it("should return value context after colon with empty value", () => {
			const ctx = getAutocompleteContext("first_name: ", 12);
			expect(ctx).toEqual({
				type: "value",
				text: "",
				field: "first_name",
				start: 12,
				end: 12,
			});
		});

		it("should return value context after comma", () => {
			const ctx = getAutocompleteContext("country: USA, UK, Ca", 20);
			expect(ctx).toEqual({
				type: "value",
				text: "Ca",
				field: "country",
				start: 18,
				end: 20,
			});
		});

		it("should return value context after comparison", () => {
			const ctx = getAutocompleteContext("age: >3", 7);
			expect(ctx).toEqual({
				type: "value",
				text: "3",
				field: "age",
				start: 6,
				end: 7,
			});
		});

		it("should return value context after textop", () => {
			const ctx = getAutocompleteContext("first_name: contains Al", 23);
			expect(ctx).toEqual({
				type: "value",
				text: "Al",
				field: "first_name",
				start: 21,
				end: 23,
			});
		});
	});

	describe("multiple field patterns - uses last field", () => {
		it("should use last field when unknown field precedes known field", () => {
			// This was the bug: "is: Alex first_name: A" should use first_name, not is
			const ctx = getAutocompleteContext("is: Alex first_name: A", 22);
			expect(ctx).toEqual({
				type: "value",
				text: "A",
				field: "first_name",
				start: 21,
				end: 22,
			});
		});

		it("should use last field in chain of multiple fields", () => {
			const ctx = getAutocompleteContext(
				"age: 30 country: USA first_name: J",
				34
			);
			expect(ctx).toEqual({
				type: "value",
				text: "J",
				field: "first_name",
				start: 33,
				end: 34,
			});
		});

		it("should use last field even when first is unknown", () => {
			const ctx = getAutocompleteContext(
				"unknown: value another: test age: 2",
				35
			);
			expect(ctx).toEqual({
				type: "value",
				text: "2",
				field: "age",
				start: 34,
				end: 35,
			});
		});

		it("should handle comma list after multiple fields", () => {
			const ctx = getAutocompleteContext("is: Alex country: USA, U", 24);
			expect(ctx).toEqual({
				type: "value",
				text: "U",
				field: "country",
				start: 23,
				end: 24,
			});
		});
	});

	describe("hash/tag context", () => {
		it("should return value context with # field after hash", () => {
			const ctx = getAutocompleteContext("#urg", 4);
			expect(ctx).toEqual({
				type: "value",
				text: "urg",
				field: "#",
				start: 1,
				end: 4,
			});
		});

		it("should return value context after hash with empty value", () => {
			const ctx = getAutocompleteContext("#", 1);
			expect(ctx).toEqual({
				type: "value",
				text: "",
				field: "#",
				start: 1,
				end: 1,
			});
		});
	});

	describe("edge cases", () => {
		it("should return null for empty text", () => {
			const ctx = getAutocompleteContext("", 0);
			expect(ctx).toBeNull();
		});

		it("should return null for cursor at position 0", () => {
			const ctx = getAutocompleteContext("test", 0);
			expect(ctx).toBeNull();
		});
	});
});

describe("getSuggestions", () => {
	const fields: IField[] = [
		{ id: "first_name", label: "First Name", type: "text" },
		{ id: "last_name", label: "Last Name", type: "text" },
		{ id: "age", label: "Age", type: "number" },
		{ id: "country", label: "Country", type: "text" },
	];

	const options = {
		country: ["USA", "UK", "Ukraine", "Australia"],
		first_name: ["Alex", "Alice", "Bob"],
		"#": ["urgent", "todo", "done"],
	};

	describe("field suggestions", () => {
		it("should return all fields for empty text", () => {
			const ctx = {
				type: "field" as const,
				text: "",
				field: null,
				start: 0,
				end: 0,
			};
			const suggestions = getSuggestions(ctx, fields, options);
			expect(suggestions).toHaveLength(4);
		});

		it("should filter fields by starts-with first, then contains", () => {
			const ctx = {
				type: "field" as const,
				text: "name",
				field: null,
				start: 0,
				end: 4,
			};
			const suggestions = getSuggestions(ctx, fields, options);
			// first_name and last_name both contain "name"
			expect(suggestions).toHaveLength(2);
			// Field suggestions return labels as id (for text insertion)
			expect(suggestions.map(s => s.id)).toContain("First Name");
			expect(suggestions.map(s => s.id)).toContain("Last Name");
		});

		it("should prioritize starts-with matches", () => {
			const ctx = {
				type: "field" as const,
				text: "first",
				field: null,
				start: 0,
				end: 5,
			};
			const suggestions = getSuggestions(ctx, fields, options);
			// Field suggestions return labels as id (for text insertion)
			expect(suggestions[0].id).toBe("First Name");
		});
	});

	describe("value suggestions", () => {
		it("should return options for known field", () => {
			const ctx = {
				type: "value" as const,
				text: "",
				field: "country",
				start: 0,
				end: 0,
			};
			const suggestions = getSuggestions(ctx, fields, options);
			expect(suggestions).toHaveLength(4);
		});

		it("should filter values by starts-with first", () => {
			const ctx = {
				type: "value" as const,
				text: "U",
				field: "country",
				start: 0,
				end: 1,
			};
			const suggestions = getSuggestions(ctx, fields, options);
			// USA, UK, Ukraine start with U; Australia contains U
			expect(suggestions[0].id).toBe("USA");
			expect(suggestions[1].id).toBe("UK");
			expect(suggestions[2].id).toBe("Ukraine");
			expect(suggestions[3].id).toBe("Australia");
		});

		it("should return empty for unknown field", () => {
			const ctx = {
				type: "value" as const,
				text: "test",
				field: "unknown",
				start: 0,
				end: 4,
			};
			const suggestions = getSuggestions(ctx, fields, options);
			expect(suggestions).toHaveLength(0);
		});

		it("should return empty for field without options", () => {
			const ctx = {
				type: "value" as const,
				text: "test",
				field: "age",
				start: 0,
				end: 4,
			};
			const suggestions = getSuggestions(ctx, fields, options);
			expect(suggestions).toHaveLength(0);
		});

		it("should return tag options for # field", () => {
			const ctx = {
				type: "value" as const,
				text: "u",
				field: "#",
				start: 0,
				end: 1,
			};
			const suggestions = getSuggestions(ctx, fields, options);
			expect(suggestions.map(s => s.id)).toContain("urgent");
		});

		it("should apply field format function to option labels", () => {
			const months = { 1: "Jan", 2: "Feb", 3: "Mar" };
			const fieldsWithFormat: IField[] = [
				{
					id: "month",
					label: "Month",
					type: "tuple",
					format: (v: any) => months[v] || String(v),
				},
			];
			const ctx = {
				type: "value" as const,
				text: "",
				field: "month",
				start: 0,
				end: 0,
			};
			const suggestions = getSuggestions(ctx, fieldsWithFormat, {
				month: [1, 2, 3, 4],
			});
			expect(suggestions.map(s => s.label)).toEqual([
				"Jan",
				"Feb",
				"Mar",
				"4",
			]);
			expect(suggestions.map(s => s.id)).toEqual([
				"Jan",
				"Feb",
				"Mar",
				"4",
			]);
		});

		it("should fuzzy-match against formatted labels", () => {
			const fieldsWithFormat: IField[] = [
				{
					id: "month",
					label: "Month",
					type: "tuple",
					format: (v: any) =>
						({ 1: "January", 2: "February", 3: "March" })[v] ||
						String(v),
				},
			];
			const ctx = {
				type: "value" as const,
				text: "jan",
				field: "month",
				start: 0,
				end: 3,
			};
			const suggestions = getSuggestions(ctx, fieldsWithFormat, {
				month: [1, 2, 3],
			});
			expect(suggestions).toHaveLength(1);
			expect(suggestions[0].id).toBe("January");
		});
	});

	describe("predicate suggestions", () => {
		const fields: IField[] = [
			{ id: "start", label: "Start", type: "date" },
			{ id: "name", label: "Name", type: "text" },
		];

		it("should return predicate suggestions for date field", () => {
			const ctx = {
				type: "predicate" as const,
				text: "",
				field: "start",
				start: 6,
				end: 6,
			};
			const suggestions = getSuggestions(ctx, fields, {});
			expect(suggestions).toHaveLength(2);
			expect(suggestions.map(s => s.id)).toContain("year");
			expect(suggestions.map(s => s.id)).toContain("month");
		});

		it("should filter predicate suggestions by typed text", () => {
			const ctx = {
				type: "predicate" as const,
				text: "y",
				field: "start",
				start: 6,
				end: 7,
			};
			const suggestions = getSuggestions(ctx, fields, {});
			expect(suggestions).toHaveLength(1);
			expect(suggestions[0].id).toBe("year");
		});

		it("should match predicate by label", () => {
			const ctx = {
				type: "predicate" as const,
				text: "mon",
				field: "start",
				start: 6,
				end: 9,
			};
			const suggestions = getSuggestions(ctx, fields, {});
			expect(suggestions).toHaveLength(1);
			expect(suggestions[0].id).toBe("month");
		});
	});
});

describe("getAutocompleteContext with predicates", () => {
	const fields: IField[] = [
		{ id: "start", label: "Start", type: "date" },
		{ id: "name", label: "Name", type: "text" },
	];

	it("should return predicate context when typing dot after date field", () => {
		const ctx = getAutocompleteContext("start.", 6, fields);
		expect(ctx).toEqual({
			type: "predicate",
			text: "",
			field: "start",
			start: 6,
			end: 6,
		});
	});

	it("should return predicate context when typing predicate name", () => {
		const ctx = getAutocompleteContext("start.y", 7, fields);
		expect(ctx).toEqual({
			type: "predicate",
			text: "y",
			field: "start",
			start: 6,
			end: 7,
		});
	});

	it("should return field context for non-date field with dot", () => {
		const ctx = getAutocompleteContext("name.", 5, fields);
		// name is not a date field, so this should be regular field context
		expect(ctx?.type).toBe("field");
	});

	it("should return field context for unknown field with dot", () => {
		const ctx = getAutocompleteContext("unknown.", 8, fields);
		expect(ctx?.type).toBe("field");
	});
});
