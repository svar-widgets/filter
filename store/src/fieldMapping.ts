// Field label sanitization and ID↔label conversion for query text.
//
// Labels are sanitized once (prepareFields) to remove parser-confusing chars.
// Conversion functions use the tokenizer to find field positions in query text,
// then swap IDs for labels (display) or labels for IDs (storage/i18n).

import type { IField } from "./types";
import { tokenize } from "./parse";

// Remove all parser-special characters (see specs/query-format.md § Special Characters)
// Strips: whitespace, : , " ' ( ) # - * > < = .
export function sanitizeLabel(label: string): string {
	return label.replace(/[\s:,"'()#\-*><.=]/g, "");
}

export function prepareFields(fields: IField[]): IField[] {
	return fields.map(f => ({
		...f,
		label: sanitizeLabel(f.label),
	}));
}

export interface FieldMaps {
	idToLabel: Map<string, string>;
	labelToId: Map<string, string>;
}

export function buildFieldMaps(fields: IField[]): FieldMaps {
	const idSet = new Set<string>();
	for (const f of fields) {
		idSet.add(String(f.id).toLowerCase());
	}

	const idToLabel = new Map<string, string>();
	const labelToId = new Map<string, string>();

	for (const f of fields) {
		const id = String(f.id);
		const label = f.label; // already sanitized
		if (!label) continue;
		if (label === id) continue;
		// Skip if label collides with a different field's ID
		const labelLower = label.toLowerCase();
		if (labelLower !== id.toLowerCase() && idSet.has(labelLower)) continue;
		idToLabel.set(id, label);
		labelToId.set(label.toLowerCase(), id);
	}

	return { idToLabel, labelToId };
}

// Replace field names in query text using tokenizer to find field positions
function replaceFields(query: string, fromMap: Map<string, string>): string {
	if (!query || fromMap.size === 0) return query;

	const tokens = tokenize(query);
	let result = "";
	let lastEnd = 0;

	for (let i = 0; i < tokens.length; i++) {
		const token = tokens[i];
		const next = tokens[i + 1];

		if (token.type === "word" && next?.type === "colon") {
			let baseName = token.value!;
			let suffix = "";

			// Handle compound: "start.year" or "StartDate.year"
			const dotIdx = baseName.indexOf(".");
			if (dotIdx >= 0) {
				suffix = baseName.substring(dotIdx);
				baseName = baseName.substring(0, dotIdx);
			}

			const replacement = fromMap.get(baseName.toLowerCase());
			if (replacement) {
				result +=
					query.substring(lastEnd, token.start) +
					replacement +
					suffix;
				lastEnd = token.end;
			}
		}
	}

	result += query.substring(lastEnd);
	return result;
}

// Convert value (with IDs) to text (with labels)
export function idsToLabels(query: string, maps: FieldMaps): string {
	if (maps.idToLabel.size === 0) return query;
	const fromMap = new Map<string, string>();
	for (const [id, label] of maps.idToLabel) {
		fromMap.set(id.toLowerCase(), label);
	}
	return replaceFields(query, fromMap);
}

// Convert text (with labels) to value (with IDs)
export function labelsToIds(query: string, maps: FieldMaps): string {
	return replaceFields(query, maps.labelToId);
}
