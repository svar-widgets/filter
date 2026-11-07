// Syntax highlighting: transforms parsed tokens into colorized HTML.
// See specs/query-format.md § Real-Time Syntax Highlighting
//
// Suppresses error styling at cursor position to reduce noise while typing.
// In free text mode, only highlights text that looks like query syntax.

import { parse } from "./parse";
import type { IField, IDataHash, AnyData } from "./types";
import type { HighlightTokenType } from "./parse";
import { getAutocompleteContext } from "./autocomplete";

export interface HighlightOptions {
	fields?: IField[];
	options?: IDataHash<AnyData[]>;
	showErrors?: boolean | number;
	cursorPos?: number;
	allowFreeText?: boolean;
}

// CSS custom properties with hex fallbacks for themability
const colorMap: Record<HighlightTokenType, string> = {
	field: "var(--wx-filter-query-field-color, #2563eb)",
	value: "var(--wx-filter-query-value-color, #16a34a)",
	operator: "var(--wx-filter-query-operator-color, #9333ea)",
	textop: "var(--wx-filter-query-operator-color, #9333ea)",
	comparison: "var(--wx-filter-query-comparison-color, #ea580c)",
	symbol: "var(--wx-filter-query-symbol-color, #6b7280)",
	wildcard: "var(--wx-filter-query-symbol-color, #6b7280)",
	negation: "var(--wx-filter-query-negation-color, #dc2626)",
	hash: "var(--wx-filter-query-symbol-color, #6b7280)",
	error: "var(--wx-filter-query-error-color, #dc2626)",
};

function escapeHtml(text: string): string {
	return text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;");
}

// cursor-1 because cursor is after the just-typed character
function isActiveToken(
	token: { start: number; end: number },
	cursor: number
): boolean {
	if (typeof cursor !== "number" || cursor <= 0) return false;
	const checkPos = cursor - 1;
	return checkPos >= token.start && checkPos < token.end;
}

export function getQueryHtml(
	text: string,
	opts: HighlightOptions = {}
): string {
	const {
		fields = [],
		options = {},
		showErrors = true,
		cursorPos = -1,
		allowFreeText = false,
	} = opts;

	if (!text) return "";

	// Only highlight if input looks like query syntax (field: or #tag patterns)
	if (allowFreeText) {
		const trimmed = text.trim();
		// Match field names with optional predicate: "field:" or "field.year:"
		const startsWithFieldColon = /^-?[\w]+(?:\.[\w]+)?\s*:/.test(trimmed);
		const startsWithHash = /^-?#/.test(trimmed);
		const startsWithParen = trimmed.startsWith("(");

		if (!startsWithFieldColon && !startsWithHash && !startsWithParen) {
			return escapeHtml(text);
		}
	}

	const result = parse(text, fields, options);
	const tokens = result.tokens;

	if (tokens.length === 0) {
		return escapeHtml(text);
	}

	// showErrors: false=never, true=always, number=suppress at that cursor position
	const errors =
		showErrors === false ? false : showErrors === true ? true : showErrors;
	const cursor = cursorPos;

	// Used for token splitting when field name is typed mid-value
	const autocompleteCtx =
		cursor > 0 ? getAutocompleteContext(text, cursor, fields) : null;

	let html = "";
	let lastEnd = 0;

	for (const token of tokens) {
		if (token.start > lastEnd) {
			html += escapeHtml(text.slice(lastEnd, token.start));
		}

		const isInvalid = token.invalid === true;
		// Skip error styling at cursor position to avoid noise while typing
		const skipError =
			isInvalid &&
			(errors === false ||
				(typeof errors === "number" && isActiveToken(token, errors)));

		const baseColor = skipError
			? "inherit"
			: colorMap[token.type] || "inherit";
		const decoration =
			isInvalid && !skipError ? "text-decoration: wavy underline;" : "";

		// Split value token when user types field name mid-value: "Open pro|" → "Open " + "pro"
		const needsSplit =
			autocompleteCtx &&
			autocompleteCtx.type === "field" &&
			token.type === "value" &&
			autocompleteCtx.start > token.start &&
			autocompleteCtx.start < token.end;

		if (needsSplit) {
			const beforeText = escapeHtml(
				text.slice(token.start, autocompleteCtx.start)
			);
			html += `<span style="color: ${baseColor}; ${decoration}">${beforeText}</span>`;

			const activeEnd = Math.min(autocompleteCtx.end, token.end);
			const activeText = escapeHtml(
				text.slice(autocompleteCtx.start, activeEnd)
			);
			html += `<span style="color: ${colorMap["field"]};">${activeText}</span>`;

			if (activeEnd < token.end) {
				const afterText = escapeHtml(text.slice(activeEnd, token.end));
				html += `<span style="color: ${baseColor}; ${decoration}">${afterText}</span>`;
			}
		} else {
			const tokenText = escapeHtml(text.slice(token.start, token.end));
			html += `<span style="color: ${baseColor}; ${decoration}">${tokenText}</span>`;
		}

		lastEnd = token.end;
	}

	if (lastEnd < text.length) {
		html += escapeHtml(text.slice(lastEnd));
	}

	return html;
}
