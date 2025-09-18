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
export type TGlue = "and" | "or";
export type TPredicate = "month" | "year";
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
	field: TID;
	type?: TType;
	predicate?: TPredicate;
	filter?: TFilterType;
	includes?: AnyData[];
	value?: AnyData;
}

export interface IDataFilter {
	id?: TID;
	parent: TID;
	$level: number;
	data?: IDataFilter[];
	$temp?: boolean;
	glue?: TGlue;
	field?: TID;
	type?: TType;
	predicate?: TPredicate;
	filter?: TFilterType;
	includes?: AnyData[];
	value?: AnyData;
}

export interface IField {
	id: TID;
	label: string;
	type: TType;
	predicate?: TPredicate;
	format?: string | ((value: AnyData) => string);
}

export interface IConfig {
	value?: IFilterSet;
	fields: IField[];
	options: TOptions;
}

export interface IDataConfig extends IConfig {
	_editor?: { id: TID };
}

export interface IData extends Omit<IDataConfig, "value"> {
	value: RulesTree;
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
	options?: { id: string | number; label: string }[];
	value?: any;
	label?: string;
	placeholder?: string;
}
