export type Terms = {
	[key: string]:
		| string
		| string[]
		| number
		| ((...args: any[]) => string)
		| Terms;
};

export const en: Terms;
export const cn: Terms;
export const de: Terms;
