// Autocomplete context detection and suggestion generation for filter queries.
// See specs/autocomplete.md
//
// Context is determined by the token preceding the cursor: colon/comma/etc → value,
// otherwise → field. For value context, walks backward to find the field name.

import type { IField, IDataHash, AnyData } from "./types";
import { tokenize, type Token } from "./parse";
import { formatDate } from "./dates";

export interface AutocompleteContext {
	type: "field" | "value" | "predicate";
	text: string;
	field: string | null;
	start: number;
	end: number;
}

export interface Suggestion {
	id: string;
	label: string;
}

// Token types that trigger value context (what follows is a value, not a field)
const VALUE_CONTEXT_TOKENS = new Set([
	"colon",
	"comma",
	"comparison",
	"textop",
]);

// Backward iteration allows early exit once we pass the cursor position
function findTokenAtCursor(tokens: Token[], cursor: number): number {
	for (let i = tokens.length - 1; i >= 0; i--) {
		const token = tokens[i];
		if (cursor >= token.start && cursor <= token.end) {
			return i;
		}
		if (cursor > token.end) {
			return i;
		}
	}
	return -1;
}

// Walks back to find field name, e.g. "status: Open, |" → "status"
function findFieldName(tokens: Token[], fromIndex: number): string | null {
	for (let i = fromIndex; i >= 0; i--) {
		const token = tokens[i];
		if (token.type === "colon" && i > 0) {
			const prev = tokens[i - 1];
			if (prev.type === "word" || prev.type === "string") {
				return prev.value || null;
			}
		}
	}
	return null;
}

// Extracts partial word at cursor from token or via regex fallback for incomplete input
function getCurrentWord(
	text: string,
	cursor: number,
	tokens: Token[]
): { word: string; start: number; end: number } {
	for (const token of tokens) {
		if (
			cursor >= token.start &&
			cursor <= token.end &&
			(token.type === "word" || token.type === "string")
		) {
			return {
				word: text.slice(token.start, cursor),
				start: token.start,
				end: cursor,
			};
		}
	}

	// Regex fallback for partially-typed words not yet tokenized
	const beforeCursor = text.slice(0, cursor);
	const wordMatch = beforeCursor.match(/[\w\-_.]+$/);
	if (wordMatch) {
		const word = wordMatch[0];
		return {
			word,
			start: cursor - word.length,
			end: cursor,
		};
	}

	return { word: "", start: cursor, end: cursor };
}

export function getAutocompleteContext(
	text: string,
	cursor: number,
	fields: IField[] = []
): AutocompleteContext | null {
	if (!text || cursor <= 0) return null;

	const tokens = tokenize(text);
	const tokenIndex = findTokenAtCursor(tokens, cursor);

	const { word, start, end } = getCurrentWord(text, cursor, tokens);

	// Context comes from the token preceding the current word, not the word itself
	let contextTokenIndex = tokenIndex;

	// When inside a word, context comes from preceding token: "status: Op|en" → ":"
	if (tokenIndex >= 0) {
		const currentToken = tokens[tokenIndex];
		if (
			(currentToken.type === "word" || currentToken.type === "string") &&
			cursor > currentToken.start &&
			cursor <= currentToken.end
		) {
			contextTokenIndex = tokenIndex - 1;
		}
	}

	if (contextTokenIndex >= 0) {
		const precedingToken = tokens[contextTokenIndex];

		if (VALUE_CONTEXT_TOKENS.has(precedingToken.type)) {
			const fieldName = findFieldName(tokens, contextTokenIndex);
			return {
				type: "value",
				text: word,
				field: fieldName,
				start,
				end,
			};
		}

		// Per spec, "#tag" uses "#" as field key for option lookup
		if (precedingToken.type === "hash") {
			return {
				type: "value",
				text: word,
				field: "#",
				start,
				end,
			};
		}

		// Wildcard means value pattern is complete — no suggestions
		if (precedingToken.type === "wildcard") {
			return null;
		}
	}

	// Check if current word contains dot (e.g., "start." or "StartDate.y")
	// This indicates potential predicate context for date fields
	if (word.includes(".")) {
		const dotIndex = word.lastIndexOf(".");
		const baseName = word.substring(0, dotIndex);
		const predicatePart = word.substring(dotIndex + 1);

		const field = fields.find(
			f => String(f.id) === baseName || f.label === baseName
		);
		if (field?.type === "date") {
			return {
				type: "predicate",
				text: predicatePart,
				field: String(field.id),
				start: start + dotIndex + 1,
				end,
			};
		}
	}

	// Default to field context (start of input, after operators, after closing paren)
	return {
		type: "field",
		text: word,
		field: null,
		start,
		end,
	};
}

// Two-tier ranking per spec: starts-with matches appear before contains matches
function fuzzyMatch<T>(
	items: T[],
	typed: string,
	getSearchStrings: (item: T) => string[],
	toSuggestion: (item: T) => Suggestion
): Suggestion[] {
	const startsWithMatch: Suggestion[] = [];
	const containsMatch: Suggestion[] = [];

	for (const item of items) {
		const searchStrings = getSearchStrings(item);
		const suggestion = toSuggestion(item);

		const startsWithAny = searchStrings.some(s => s.startsWith(typed));
		const containsAny = searchStrings.some(s => s.includes(typed));

		// Mutually exclusive buckets: if it starts-with, don't add to contains
		if (startsWithAny) {
			startsWithMatch.push(suggestion);
		} else if (containsAny) {
			containsMatch.push(suggestion);
		}
	}

	return [...startsWithMatch, ...containsMatch];
}

// Available predicates for date fields
const DATE_PREDICATES: Suggestion[] = [
	{ id: "year", label: "Year" },
	{ id: "month", label: "Month" },
];

function formatValue(value: AnyData): string {
	if (value instanceof Date) {
		return formatDate(value);
	}
	return String(value);
}

export function getSuggestions(
	context: AutocompleteContext | null,
	fields: IField[],
	options: IDataHash<AnyData[]>
): Suggestion[] {
	if (!context) return [];

	const typed = context.text.toLowerCase();

	if (context.type === "field") {
		// Match against both id and label; insert label into text (display form)
		return fuzzyMatch(
			fields,
			typed,
			f => [String(f.id).toLowerCase(), f.label.toLowerCase()],
			f => ({ label: f.label, id: f.label || String(f.id) })
		);
	}

	if (context.type === "predicate") {
		// Suggest predicates (year, month) for date fields
		return fuzzyMatch(
			DATE_PREDICATES,
			typed,
			p => [p.id.toLowerCase(), p.label.toLowerCase()],
			p => p
		);
	}

	if (context.type === "value" && context.field) {
		// Resolve field name (could be label) to ID for options lookup
		let fieldKey = context.field;
		const resolvedField = fields.find(
			f => String(f.id) === fieldKey || f.label === fieldKey
		);
		if (resolvedField) {
			fieldKey = String(resolvedField.id);
		}
		const fieldOptions = options[fieldKey];
		if (Array.isArray(fieldOptions)) {
			const fmt =
				typeof resolvedField?.format === "function"
					? (v: AnyData) =>
							String(
								(
									resolvedField.format as (
										v: AnyData
									) => string
								)(v)
							)
					: formatValue;
			return fuzzyMatch(
				fieldOptions,
				typed,
				opt => [fmt(opt).toLowerCase()],
				opt => {
					const str = fmt(opt);
					return { label: str, id: str };
				}
			);
		}
	}

	return [];
}
