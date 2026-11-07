// Lexer for filter query syntax. See specs/query-format.md
//
// Produces raw tokens preserving position info for syntax highlighting.
// Reserved words (and/or/contains/starts/ends) are recognized as distinct token types.

import type { Token } from "./types";

const TEXT_OPERATORS = ["contains", "starts", "ends"] as const;
const LOGICAL_OPERATORS = ["and", "or"] as const;

export { TEXT_OPERATORS, LOGICAL_OPERATORS };

export class Tokenizer {
	private input: string;
	private pos: number;
	private tokens: Token[];
	// offset adjusts token positions when tokenizing a substring of original input
	private offset: number;

	constructor(input: string, offset = 0) {
		this.input = input;
		this.pos = 0;
		this.tokens = [];
		this.offset = offset;
	}

	private peek(offset = 0): string | undefined {
		return this.input[this.pos + offset];
	}

	private advance(count = 1): void {
		this.pos += count;
	}

	private isEnd(): boolean {
		return this.pos >= this.input.length;
	}

	private skipWhitespace(): void {
		while (!this.isEnd() && /\s/.test(this.peek()!)) {
			this.advance();
		}
	}

	private readQuotedString(): Token {
		const start = this.pos + this.offset;
		const quote = this.peek();
		this.advance();
		let value = "";
		while (!this.isEnd() && this.peek() !== quote) {
			if (this.peek() === "\\") {
				this.advance();
				if (!this.isEnd()) {
					value += this.peek();
					this.advance();
				}
			} else {
				value += this.peek();
				this.advance();
			}
		}
		if (this.peek() === quote) {
			this.advance();
		}
		return {
			type: "string",
			value,
			quoted: true,
			start,
			end: this.pos + this.offset,
		};
	}

	private readWord(): { value: string; start: number; end: number } {
		const start = this.pos + this.offset;
		let value = "";
		// Stop at range operator ".." to separate "25..50" into [word, range, word]
		while (
			!this.isEnd() &&
			!/[\s:,()"]/.test(this.peek()!) &&
			this.peek() !== "*" &&
			!(this.peek() === "." && this.peek(1) === ".")
		) {
			value += this.peek();
			this.advance();
		}
		return { value, start, end: this.pos + this.offset };
	}

	tokenize(): Token[] {
		while (!this.isEnd()) {
			this.skipWhitespace();
			if (this.isEnd()) break;

			const char = this.peek()!;
			const start = this.pos + this.offset;

			if (char === '"' || char === "'") {
				this.tokens.push(this.readQuotedString());
				continue;
			}

			if (char === "(") {
				this.tokens.push({ type: "lparen", start, end: start + 1 });
				this.advance();
				continue;
			}

			if (char === ")") {
				this.tokens.push({ type: "rparen", start, end: start + 1 });
				this.advance();
				continue;
			}

			if (char === ":") {
				this.tokens.push({ type: "colon", start, end: start + 1 });
				this.advance();
				continue;
			}

			if (char === ",") {
				this.tokens.push({ type: "comma", start, end: start + 1 });
				this.advance();
				continue;
			}

			if (char === "#") {
				this.tokens.push({ type: "hash", start, end: start + 1 });
				this.advance();
				continue;
			}

			if (char === "*") {
				this.tokens.push({ type: "wildcard", start, end: start + 1 });
				this.advance();
				continue;
			}

			if (char === "-") {
				this.tokens.push({ type: "minus", start, end: start + 1 });
				this.advance();
				continue;
			}

			if (char === ">" || char === "<") {
				if (this.peek(1) === "=") {
					this.tokens.push({
						type: "comparison",
						value: char + "=",
						start,
						end: start + 2,
					});
					this.advance(2);
				} else {
					this.tokens.push({
						type: "comparison",
						value: char,
						start,
						end: start + 1,
					});
					this.advance();
				}
				continue;
			}

			if (char === "." && this.peek(1) === ".") {
				this.tokens.push({ type: "range", start, end: start + 2 });
				this.advance(2);
				continue;
			}

			const {
				value: word,
				start: wordStart,
				end: wordEnd,
			} = this.readWord();
			if (word) {
				const lower = word.toLowerCase();
				if (
					LOGICAL_OPERATORS.includes(
						lower as (typeof LOGICAL_OPERATORS)[number]
					)
				) {
					this.tokens.push({
						type: "logical",
						value: lower,
						start: wordStart,
						end: wordEnd,
					});
				} else if (
					TEXT_OPERATORS.includes(
						lower as (typeof TEXT_OPERATORS)[number]
					)
				) {
					this.tokens.push({
						type: "textop",
						value: lower,
						start: wordStart,
						end: wordEnd,
					});
				} else {
					this.tokens.push({
						type: "word",
						value: word,
						start: wordStart,
						end: wordEnd,
					});
				}
			}
		}

		return this.tokens;
	}
}

export function tokenize(text: string): Token[] {
	if (!text) return [];
	const tokenizer = new Tokenizer(text, 0);
	return tokenizer.tokenize();
}
