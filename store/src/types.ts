import type { IDataMethodsConfig } from "./DataStore";
import type RulesTree from "./RulesTree";
import type { TID } from "@svar-ui/lib-state";

export type TMethodsConfig = IDataMethodsConfig;
export type AnyData = number | string | Date;

export type TGlue = "and" | "or";
export interface IFilterSet {
	rules?: (IFilter | IFilterSet)[];
	glue?: TGlue;
}
export type TPredicate = "month" | "year";

export type TOptions = IDataHash<AnyData[]> | ((v: any) => AnyData[]);

export interface IFilter {
	field: TID;
	type?: string;
	predicate?: TPredicate;
	filter?: string;
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
	type?: string;
	predicate?: TPredicate;
	filter?: string;
	includes?: AnyData[];
	value?: AnyData;
}

export interface IField {
	id: TID;
	label: string;
	type: string;
	predicate?: TPredicate;
	format?: string | ((v: AnyData) => string);
}

export interface IDataConfig {
	value: IFilterSet;
	fields: IField[];
	options: TOptions;
	_editor?: { id: TID };
}

export interface IData {
	value: RulesTree;
	fields: IField[];
	options: TOptions;
	_editor?: { id: TID };
}

export interface IDataHash<T> {
	[key: string]: T;
}
