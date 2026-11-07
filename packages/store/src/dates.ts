// Date utilities using local time to avoid UTC timezone shift in user-facing values.

export function formatDate(date: Date): string {
	if (!(date instanceof Date) || isNaN(date.getTime())) {
		return String(date);
	}
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, "0");
	const d = String(date.getDate()).padStart(2, "0");
	return `${y}-${m}-${d}`;
}

export function parseDate(str: string): Date | null {
	if (typeof str !== "string") return null;
	const match = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
	if (!match) return null;
	const [, y, m, d] = match.map(Number);
	return new Date(y, m - 1, d);
}

export function normalizeDate(value: string): string {
	const parts = value.split("-");
	if (parts.length === 3) {
		const [y, m, d] = parts;
		return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
	}
	if (parts.length === 2) {
		const [y, m] = parts;
		return `${y}-${m.padStart(2, "0")}`;
	}
	return value;
}
