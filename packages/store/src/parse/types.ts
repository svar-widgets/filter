import type { IFilterSet, IFilter } from "../types";

export type TokenType =
	| "string"
	| "word"
	| "lparen"
	| "rparen"
	| "colon"
	| "comma"
	| "hash"
	| "wildcard"
	| "minus"
	| "comparison"
	| "range"
	| "logical"
	| "textop";

export interface Token {
	type: TokenType;
	value?: string;
	quoted?: boolean;
	start: number;
	end: number;
}

export interface ParsedValue {
	value: unknown;
	excluded: boolean;
	filter: import("../types").TFilterType | null;
	rangeEnd: unknown;
	startsWild: boolean;
	endsWild: boolean;
}

export type HighlightTokenType =
	| "field"
	| "value"
	| "operator"
	| "textop"
	| "comparison"
	| "symbol"
	| "wildcard"
	| "negation"
	| "hash"
	| "error";

export interface HighlightToken {
	type: HighlightTokenType;
	start: number;
	end: number;
	invalid?: boolean;
}

export type ValidationErrorCode =
	| "UNKNOWN_FIELD"
	| "EXPECTED_NUMBER"
	| "EXPECTED_DATE"
	| "PARSE_ERROR"
	| "NO_DATA";

export interface ValidationError {
	code: ValidationErrorCode;
	field?: string;
	value?: string;
	message?: string;
}

export interface ParseResult {
	config: IFilterSet | IFilter | null;
	isInvalid: boolean | ValidationError;
	startOperation: string | null;
	tokens: HighlightToken[];
	naturalText: string | null;
}

export interface ParseOptions {
	allowFreeText?: boolean;
}
