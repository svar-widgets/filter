import type {
	AnyData,
	IApi,
	IFilter,
	IFilterBarField,
	IFilterSet,
	ParseResult,
	TMethodsConfig,
	ValidationError,
} from "@svar-ui/filter-store";

type DashlessKey<S extends string> = S extends `${infer A}-${infer B}`
	? `${A}${DashlessKey<B>}`
	: S;

// "add-rule" action -> onaddrule prop, etc.; other actions go to on<name> too
export type FilterBuilderActions<
	T extends Record<string, any> = TMethodsConfig,
> = {
	[K in keyof T as `on${DashlessKey<K & string>}`]?: (ev: T[K]) => void;
} & {
	[key: `on${string}`]: ((ev?: any) => void) | undefined;
};

export interface IFilterBarGroup {
	type: "all" | "dynamic";
	by: (string | IFilterBarField)[];
	label?: string;
	placeholder?: string;
	value?: AnyData;
}

export type TFilterBarField = string | IFilterBarField | IFilterBarGroup;

export interface FilterQueryEvent {
	value: string | IFilterSet | IFilter | null;
	text: string;
	parsed?: ParseResult;
	error?: ValidationError | null;
	startProgress: () => void;
	endProgress: () => void;
}

export type TFilterQueryParse = "none" | "strict" | "allowFreeText";

// locale terms used by the widget; getRaw() returns them untyped
export interface IRawTerms {
	calendar: {
		dayShort: string[];
		dayFull: string[];
		monthShort: string[];
		monthFull: string[];
	};
	formats?: { dateFormat?: string };
	filter?: { dateFormat?: string };
}

// API shared with inner components through the "filter-store" context
export type IFilterContext = Pick<
	IApi,
	"getState" | "getReactiveState" | "exec"
>;
