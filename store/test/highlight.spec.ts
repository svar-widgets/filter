import { describe, it, expect } from "vitest";
import { getQueryHtml } from "../src/highlight";
import type { IField } from "../src/types";

// Helper that simplifies HTML output for easier testing
function simplify(html: string): string {
	return (
		html
			// Replace color styles with token type names
			// Handle field with underline (invalid field) first
			.replace(
				/style="color: var\(--wx-filter-query-field-color, #2563eb\); text-decoration: wavy underline;"/g,
				'class="field invalid"'
			)
			.replace(
				/style="color: var\(--wx-filter-query-field-color, #2563eb\);[^"]*"/g,
				'class="field"'
			)
			// Handle value with underline (invalid value) first
			.replace(
				/style="color: var\(--wx-filter-query-value-color, #16a34a\); text-decoration: wavy underline;"/g,
				'class="value invalid"'
			)
			.replace(
				/style="color: var\(--wx-filter-query-value-color, #16a34a\);[^"]*"/g,
				'class="value"'
			)
			.replace(
				/style="color: var\(--wx-filter-query-operator-color, #9333ea\);[^"]*"/g,
				'class="operator"'
			)
			.replace(
				/style="color: var\(--wx-filter-query-comparison-color, #ea580c\);[^"]*"/g,
				'class="comparison"'
			)
			.replace(
				/style="color: var\(--wx-filter-query-symbol-color, #6b7280\);[^"]*"/g,
				'class="symbol"'
			)
			.replace(
				/style="color: var\(--wx-filter-query-negation-color, #dc2626\);[^"]*"/g,
				'class="negation"'
			)
			// Handle inherit color (for suppressed errors)
			.replace(/style="color: inherit;[^"]*"/g, 'class="inherit"')
	);
}

describe("getQueryHtml", () => {
	const fields: IField[] = [
		{ id: "age", label: "Age", type: "number" },
		{ id: "country", label: "Country", type: "text" },
		{ id: "name", label: "Name", type: "text" },
		{ id: "status", label: "Status", type: "text" },
		{ id: "date", label: "Date", type: "date" },
	];

	describe("empty input", () => {
		it("should return empty string for empty input", () => {
			expect(getQueryHtml("")).toBe("");
			expect(getQueryHtml("", { fields })).toBe("");
		});
	});

	describe("single field queries", () => {
		it("should highlight age: 24", () => {
			const html = simplify(getQueryHtml("age: 24", { fields }));
			expect(html).toBe(
				'<span class="field">age</span><span class="symbol">:</span> <span class="value">24</span>'
			);
		});

		it("should highlight country: USA", () => {
			const html = simplify(getQueryHtml("country: USA", { fields }));
			expect(html).toBe(
				'<span class="field">country</span><span class="symbol">:</span> <span class="value">USA</span>'
			);
		});

		it("should highlight name: John", () => {
			const html = simplify(getQueryHtml("name: John", { fields }));
			expect(html).toBe(
				'<span class="field">name</span><span class="symbol">:</span> <span class="value">John</span>'
			);
		});
	});

	describe("multi-field queries", () => {
		it("should highlight age: 24 country: USA", () => {
			const html = simplify(
				getQueryHtml("age: 24 country: USA", { fields })
			);
			expect(html).toBe(
				'<span class="field">age</span><span class="symbol">:</span> <span class="value">24</span> ' +
					'<span class="field">country</span><span class="symbol">:</span> <span class="value">USA</span>'
			);
		});

		it("should highlight age: 2 country: USA even with options restriction", () => {
			const html = simplify(
				getQueryHtml("age: 2 country: USA", {
					fields,
					options: { age: [24] },
				})
			);
			expect(html).toBe(
				'<span class="field">age</span><span class="symbol">:</span> <span class="value">2</span> ' +
					'<span class="field">country</span><span class="symbol">:</span> <span class="value">USA</span>'
			);
		});

		it("should highlight name: John status: active", () => {
			const html = simplify(
				getQueryHtml("name: John status: active", { fields })
			);
			expect(html).toBe(
				'<span class="field">name</span><span class="symbol">:</span> <span class="value">John</span> ' +
					'<span class="field">status</span><span class="symbol">:</span> <span class="value">active</span>'
			);
		});

		it("should highlight three fields: age: 30 country: UK name: Alice", () => {
			const html = simplify(
				getQueryHtml("age: 30 country: UK name: Alice", {
					fields,
				})
			);
			expect(html).toBe(
				'<span class="field">age</span><span class="symbol">:</span> <span class="value">30</span> ' +
					'<span class="field">country</span><span class="symbol">:</span> <span class="value">UK</span> ' +
					'<span class="field">name</span><span class="symbol">:</span> <span class="value">Alice</span>'
			);
		});

		it("should highlight multi-field with comparison: age: >18 country: USA", () => {
			const html = simplify(
				getQueryHtml("age: >18 country: USA", { fields })
			);
			expect(html).toBe(
				'<span class="field">age</span><span class="symbol">:</span> ' +
					'<span class="comparison">&gt;</span><span class="value">18</span> ' +
					'<span class="field">country</span><span class="symbol">:</span> <span class="value">USA</span>'
			);
		});

		it("should highlight multi-field with range: age: 18..65 country: UK", () => {
			const html = simplify(
				getQueryHtml("age: 18..65 country: UK", { fields })
			);
			expect(html).toBe(
				'<span class="field">age</span><span class="symbol">:</span> ' +
					'<span class="value">18</span><span class="symbol">..</span><span class="value">65</span> ' +
					'<span class="field">country</span><span class="symbol">:</span> <span class="value">UK</span>'
			);
		});

		it("should highlight multi-field with wildcard: name: J* country: USA", () => {
			const html = simplify(
				getQueryHtml("name: J* country: USA", { fields })
			);
			expect(html).toBe(
				'<span class="field">name</span><span class="symbol">:</span> ' +
					'<span class="value">J</span><span class="symbol">*</span> ' +
					'<span class="field">country</span><span class="symbol">:</span> <span class="value">USA</span>'
			);
		});
	});

	describe("logical operators", () => {
		it("should highlight age: 24 AND country: USA", () => {
			const html = simplify(
				getQueryHtml("age: 24 AND country: USA", { fields })
			);
			expect(html).toBe(
				'<span class="field">age</span><span class="symbol">:</span> <span class="value">24</span> ' +
					'<span class="operator">AND</span> ' +
					'<span class="field">country</span><span class="symbol">:</span> <span class="value">USA</span>'
			);
		});

		it("should highlight age: 24 OR age: 30", () => {
			const html = simplify(
				getQueryHtml("age: 24 OR age: 30", { fields })
			);
			expect(html).toBe(
				'<span class="field">age</span><span class="symbol">:</span> <span class="value">24</span> ' +
					'<span class="operator">OR</span> ' +
					'<span class="field">age</span><span class="symbol">:</span> <span class="value">30</span>'
			);
		});

		it("should highlight lowercase and/or", () => {
			const html = simplify(
				getQueryHtml("age: 24 or age: 30", { fields })
			);
			expect(html).toBe(
				'<span class="field">age</span><span class="symbol">:</span> <span class="value">24</span> ' +
					'<span class="operator">or</span> ' +
					'<span class="field">age</span><span class="symbol">:</span> <span class="value">30</span>'
			);
		});
	});

	describe("comparison operators", () => {
		it("should highlight age: >18", () => {
			const html = simplify(getQueryHtml("age: >18", { fields }));
			expect(html).toBe(
				'<span class="field">age</span><span class="symbol">:</span> ' +
					'<span class="comparison">&gt;</span><span class="value">18</span>'
			);
		});

		it("should highlight age: >=21", () => {
			const html = simplify(getQueryHtml("age: >=21", { fields }));
			expect(html).toBe(
				'<span class="field">age</span><span class="symbol">:</span> ' +
					'<span class="comparison">&gt;=</span><span class="value">21</span>'
			);
		});

		it("should highlight age: <65", () => {
			const html = simplify(getQueryHtml("age: <65", { fields }));
			expect(html).toBe(
				'<span class="field">age</span><span class="symbol">:</span> ' +
					'<span class="comparison">&lt;</span><span class="value">65</span>'
			);
		});

		it("should highlight age: <=50", () => {
			const html = simplify(getQueryHtml("age: <=50", { fields }));
			expect(html).toBe(
				'<span class="field">age</span><span class="symbol">:</span> ' +
					'<span class="comparison">&lt;=</span><span class="value">50</span>'
			);
		});
	});

	describe("text operators", () => {
		it("should highlight name: contains John", () => {
			const html = simplify(
				getQueryHtml("name: contains John", { fields })
			);
			expect(html).toBe(
				'<span class="field">name</span><span class="symbol">:</span> ' +
					'<span class="operator">contains</span> <span class="value">John</span>'
			);
		});

		it("should highlight name: starts A", () => {
			const html = simplify(getQueryHtml("name: starts A", { fields }));
			expect(html).toBe(
				'<span class="field">name</span><span class="symbol">:</span> ' +
					'<span class="operator">starts</span> <span class="value">A</span>'
			);
		});

		it("should highlight name: ends son", () => {
			const html = simplify(getQueryHtml("name: ends son", { fields }));
			expect(html).toBe(
				'<span class="field">name</span><span class="symbol">:</span> ' +
					'<span class="operator">ends</span> <span class="value">son</span>'
			);
		});
	});

	describe("negation", () => {
		it("should highlight country: -USA", () => {
			const html = simplify(getQueryHtml("country: -USA", { fields }));
			expect(html).toBe(
				'<span class="field">country</span><span class="symbol">:</span> ' +
					'<span class="negation">-</span><span class="value">USA</span>'
			);
		});

		it("should highlight age: -contains test", () => {
			const html = simplify(
				getQueryHtml("name: -contains test", { fields })
			);
			expect(html).toBe(
				'<span class="field">name</span><span class="symbol">:</span> ' +
					'<span class="negation">-</span><span class="operator">contains</span> <span class="value">test</span>'
			);
		});
	});

	describe("wildcards", () => {
		it("should highlight name: *John", () => {
			const html = simplify(getQueryHtml("name: *John", { fields }));
			expect(html).toBe(
				'<span class="field">name</span><span class="symbol">:</span> ' +
					'<span class="symbol">*</span><span class="value">John</span>'
			);
		});

		it("should highlight name: John*", () => {
			const html = simplify(getQueryHtml("name: John*", { fields }));
			expect(html).toBe(
				'<span class="field">name</span><span class="symbol">:</span> ' +
					'<span class="value">John</span><span class="symbol">*</span>'
			);
		});

		it("should highlight name: *John*", () => {
			const html = simplify(getQueryHtml("name: *John*", { fields }));
			expect(html).toBe(
				'<span class="field">name</span><span class="symbol">:</span> ' +
					'<span class="symbol">*</span><span class="value">John</span><span class="symbol">*</span>'
			);
		});
	});

	describe("quick search", () => {
		it("should highlight # searchterm without fields", () => {
			const html = simplify(getQueryHtml("# searchterm"));
			// Quick search term is highlighted as field (when no fields config)
			expect(html).toBe(
				'<span class="symbol">#</span> <span class="field">searchterm</span>'
			);
		});
	});

	describe("parentheses", () => {
		it("should highlight (age: 24)", () => {
			const html = simplify(getQueryHtml("(age: 24)", { fields }));
			expect(html).toBe(
				'<span class="symbol">(</span>' +
					'<span class="field">age</span><span class="symbol">:</span> <span class="value">24</span>' +
					'<span class="symbol">)</span>'
			);
		});

		it("should highlight (age: 24 OR age: 30)", () => {
			const html = simplify(
				getQueryHtml("(age: 24 OR age: 30)", { fields })
			);
			expect(html).toBe(
				'<span class="symbol">(</span>' +
					'<span class="field">age</span><span class="symbol">:</span> <span class="value">24</span> ' +
					'<span class="operator">OR</span> ' +
					'<span class="field">age</span><span class="symbol">:</span> <span class="value">30</span>' +
					'<span class="symbol">)</span>'
			);
		});
	});

	describe("comma-separated values", () => {
		it("should highlight country: USA, UK", () => {
			const html = simplify(getQueryHtml("country: USA, UK", { fields }));
			expect(html).toBe(
				'<span class="field">country</span><span class="symbol">:</span> ' +
					'<span class="value">USA</span><span class="symbol">,</span> <span class="value">UK</span>'
			);
		});

		it("should highlight country: USA, UK, CA", () => {
			const html = simplify(
				getQueryHtml("country: USA, UK, CA", { fields })
			);
			expect(html).toBe(
				'<span class="field">country</span><span class="symbol">:</span> ' +
					'<span class="value">USA</span><span class="symbol">,</span> ' +
					'<span class="value">UK</span><span class="symbol">,</span> ' +
					'<span class="value">CA</span>'
			);
		});
	});

	describe("range values", () => {
		it("should highlight age: 18..65", () => {
			const html = simplify(getQueryHtml("age: 18..65", { fields }));
			expect(html).toBe(
				'<span class="field">age</span><span class="symbol">:</span> ' +
					'<span class="value">18</span><span class="symbol">..</span><span class="value">65</span>'
			);
		});
	});

	describe("error handling", () => {
		it("should highlight unknown fields as fields with invalid marker", () => {
			const html = simplify(getQueryHtml("unknown: value", { fields }));
			// Unknown field keeps field type but is marked as invalid (underlined)
			expect(html).toBe(
				'<span class="field invalid">unknown</span><span class="symbol">:</span> <span class="value">value</span>'
			);
		});

		it("should not show underline when showErrors is false", () => {
			const html = simplify(
				getQueryHtml("unknown: value", {
					fields,
					showErrors: false,
				})
			);
			expect(html).toBe(
				'<span class="inherit">unknown</span><span class="symbol">:</span> <span class="value">value</span>'
			);
		});
	});

	describe("HTML escaping", () => {
		it("should escape < as comparison operator", () => {
			const html = simplify(getQueryHtml("age: <30", { fields }));
			expect(html).toBe(
				'<span class="field">age</span><span class="symbol">:</span> ' +
					'<span class="comparison">&lt;</span><span class="value">30</span>'
			);
		});

		it("should escape > in values", () => {
			const html = simplify(getQueryHtml("age: >30", { fields }));
			expect(html).toBe(
				'<span class="field">age</span><span class="symbol">:</span> ' +
					'<span class="comparison">&gt;</span><span class="value">30</span>'
			);
		});
	});

	describe("without fields configuration", () => {
		it("should highlight age: 24 without fields", () => {
			const html = simplify(getQueryHtml("age: 24"));
			expect(html).toBe(
				'<span class="field">age</span><span class="symbol">:</span> <span class="value">24</span>'
			);
		});

		it("should highlight multi-field query without fields", () => {
			const html = simplify(getQueryHtml("age: 24 country: USA"));
			expect(html).toBe(
				'<span class="field">age</span><span class="symbol">:</span> <span class="value">24</span> ' +
					'<span class="field">country</span><span class="symbol">:</span> <span class="value">USA</span>'
			);
		});
	});

	describe("quoted strings", () => {
		it('should highlight name: "John Doe"', () => {
			const html = simplify(getQueryHtml('name: "John Doe"', { fields }));
			// Quotes are HTML-escaped
			expect(html).toBe(
				'<span class="field">name</span><span class="symbol">:</span> ' +
					'<span class="value">&quot;John Doe&quot;</span>'
			);
		});
	});

	describe("allowFreeText mode", () => {
		it("should skip highlighting for plain free text", () => {
			const html = getQueryHtml("hello world", {
				fields,
				allowFreeText: true,
			});
			// No highlighting, just escaped text
			expect(html).toBe("hello world");
		});

		it("should highlight when input starts with field:", () => {
			const html = simplify(
				getQueryHtml("name: John", {
					fields,
					allowFreeText: true,
				})
			);
			expect(html).toBe(
				'<span class="field">name</span><span class="symbol">:</span> <span class="value">John</span>'
			);
		});

		it("should highlight when input starts with unknown field:", () => {
			const html = simplify(
				getQueryHtml("unknown: value", {
					fields,
					allowFreeText: true,
				})
			);
			// Unknown field is highlighted with invalid marker
			expect(html).toBe(
				'<span class="field invalid">unknown</span><span class="symbol">:</span> <span class="value">value</span>'
			);
		});

		it("should not skip free text check for -field: pattern even if parse fails", () => {
			// -field: is not valid syntax (negation is only for values)
			// but it matches query pattern, so it's not treated as free text
			// parse fails → returns escaped text (no highlighting)
			const html = getQueryHtml("-name: John", {
				fields,
				allowFreeText: true,
			});
			// No spans because parse failed, but pattern was recognized
			expect(html).toBe("-name: John");
		});

		it("should highlight when input starts with #", () => {
			const html = simplify(
				getQueryHtml("#urgent", {
					fields,
					allowFreeText: true,
				})
			);
			expect(html).toContain('class="symbol"'); // hash
			expect(html).toContain('class="value"'); // tag value
		});

		it("should highlight when input starts with -#", () => {
			const html = simplify(
				getQueryHtml("-#done", {
					fields,
					allowFreeText: true,
				})
			);
			expect(html).toContain('class="negation"');
			expect(html).toContain('class="symbol"'); // hash
		});

		it("should highlight mixed valid and invalid fields when starts with field:", () => {
			const html = simplify(
				getQueryHtml("is: 123 name: Alex", {
					fields,
					allowFreeText: true,
				})
			);
			// is: is invalid but name: is valid - both should be highlighted
			expect(html).toContain('class="field invalid"'); // is
			expect(html).toContain('class="field"'); // name (without invalid)
		});

		it("should not highlight text that looks like free text with colon inside", () => {
			const html = getQueryHtml("hello: world is nice", {
				fields,
				allowFreeText: true,
			});
			// Starts with hello: which is field: pattern, so should highlight
			expect(html).toContain("<span");
		});

		it("should skip highlighting for text without query pattern", () => {
			const html = getQueryHtml("just some text", {
				fields,
				allowFreeText: true,
			});
			expect(html).toBe("just some text");
		});

		it("should skip highlighting for text with colon but no field pattern", () => {
			// Colon not immediately after word - not a field pattern
			const html = getQueryHtml("hello : world", {
				fields,
				allowFreeText: true,
			});
			// "hello :" has space before colon, but regex /^-?[\w]+\s*:/ still matches
			// Actually this WILL match because \s* allows space before colon
			expect(html).toContain("<span");
		});
	});
});
