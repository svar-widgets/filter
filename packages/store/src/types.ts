import type { IDataMethodsConfig } from "./DataStore";
import type DataStore from "./DataStore";
import type RulesTree from "./RulesTree";
import type {
	TID,
	IEventBus,
	IPublicWritable,
	IEventConfig,
} from "@svar-ui/lib-state";

export type TMethodsConfig = IDataMethodsConfig;
export type AnyData = number | string | Date;
// value of "between" and "notBetween" filters
export type TRangeValue = { start: AnyData; end?: AnyData | null };
export type TGlue = "and" | "or";
export type TPredicate = "month" | "year" | "yearMonth";
export type TType = "number" | "text" | "date" | "tuple";
export type TFilterType =
	| "greater"
	| "less"
	| "greaterOrEqual"
	| "lessOrEqual"
	| "equal"
	| "notEqual"
	| "contains"
	| "notContains"
	| "beginsWith"
	| "notBeginsWith"
	| "endsWith"
	| "notEndsWith"
	| "between"
	| "notBetween";

export type TOptions =
	| IDataHash<AnyData[]>
	| ((field: string) => AnyData[] | Promise<AnyData[]>);
export type TSingleOptions =
	| AnyData[]
	| ((field: string) => AnyData[] | Promise<AnyData[]>);

export interface IFilterSet {
	rules?: (IFilter | IFilterSet)[];
	glue?: TGlue;
}

export interface IFilter {
	field: string | "*"; // "*" means any field (quick search)
	type?: TType;
	predicate?: TPredicate;
	filter?: TFilterType;
	includes?: AnyData[];
	value?: AnyData | TRangeValue;
}

export interface IDataFilter {
	id?: TID;
	parent: TID;
	$level: number;
	data?: IDataFilter[];
	$temp?: boolean;
	glue?: TGlue;
	field?: string;
	type?: TType;
	predicate?: TPredicate;
	filter?: TFilterType;
	includes?: AnyData[];
	value?: AnyData | TRangeValue;
}

export interface IField {
	id: string;
	label: string;
	type: TType;
	predicate?: TPredicate;
	format?: string | ((value: AnyData) => string);
}

export interface IConfig {
	value?: IFilterSet;
	fields: IField[];
	options: TOptions | null;
}

export interface IDataConfig extends IConfig {
	_editor?: { id: TID } | null;
}

export interface IData extends Omit<IDataConfig, "value" | "options"> {
	value: RulesTree;
	// init() turns an options hash into a function
	options: ((field: string) => AnyData[] | Promise<AnyData[]>) | null;
}

export interface IDataHash<T> {
	[key: string]: T;
}

export interface IApi {
	exec: <A extends keyof TMethodsConfig | (string & {})>(
		action: A,
		params?: A extends keyof TMethodsConfig ? TMethodsConfig[A] : any
	) => Promise<any>;
	on: <A extends keyof TMethodsConfig | (string & {})>(
		action: A,
		callback: (
			config: A extends keyof TMethodsConfig ? TMethodsConfig[A] : any
		) => any,
		config?: IEventConfig
	) => void;
	intercept: <A extends keyof TMethodsConfig | (string & {})>(
		action: A,
		callback: (
			config: A extends keyof TMethodsConfig ? TMethodsConfig[A] : any
		) => any,
		config?: IEventConfig
	) => void;
	detach: (tag: IEventConfig["tag"]) => void;
	setNext: (ev: IEventBus<TMethodsConfig>) => void;
	getState: () => IData;
	getReactiveState: () => {
		[Key in keyof IData]: IPublicWritable<IData[Key]>;
	};
	getStores: () => { data: DataStore };
	getValue: () => IFilterSet;
}

export interface IFilterBarField {
	type: string;
	id: string;
	filter?: TFilterType;
	// plain values are turned into { id: value, label: value }
	options?: (AnyData | { id: string | number; label: string })[];
	value?: any;
	label?: string;
	placeholder?: string;
}

// Filter helper types
export type ArrayFilterFunction = (value: any[]) => any[];
export type FilterFunction = (value: any) => boolean;
export type OptionsMap = { [key: string]: any[] };

export interface LocatorConfig {
	predicate?: string;
	sort?: boolean | ((a: any, b: any) => number);
	type?: string;
}

export interface FilterOptions {
	orNull?: boolean;
}
