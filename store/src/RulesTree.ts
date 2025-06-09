import { DataTree, uid } from "wx-lib-state";
import type { TID } from "wx-lib-state";
import type { IFilter, IFilterSet, IDataFilter } from "./types";
import {
	getFilter,
	NumberFilters,
	DateFilters,
	TextFilters,
	TupleFilters,
} from "./filters";

export default class RulesTree extends DataTree<IDataFilter> {
	constructor(data: IFilter) {
		super();
		this.parseRules(data);
	}
	getRoot() {
		return this.getBranch(0)[0];
	}
	parseRules(v: IFilter) {
		this.parse(prepareData(v), 0);
	}
	remove(id: TID) {
		let obj = this.byId(id);
		super.remove(id);

		// delete all empty parents
		while (obj.parent) {
			obj = this.byId(obj.parent);
			if (obj.parent && !obj.data) {
				super.remove(obj.id);
			}
		}
	}
	serialize(): IFilterSet {
		const top = this.getBranch(0)[0];
		return serializeBranch(top) as IFilterSet;
	}
}

function prepareData(v: IFilter): IDataFilter[] {
	const out: IDataFilter[] = [];
	prepareDataInner([v], 0, out);
	return out;
}
function prepareDataInner(
	v: (IFilter | IFilterSet)[],
	parent: TID,
	out: IDataFilter[]
) {
	v.forEach(a => {
		const b: IDataFilter = { ...a, parent, id: uid(), $level: 0 };
		out.push(b);

		if ((a as IFilterSet).rules)
			prepareDataInner((a as IFilterSet).rules, b.id, out);
	});
}

function serializeBranch(top: IDataFilter): IFilter | IFilterSet {
	if (top.data && top.data.length) {
		return {
			glue: top.glue,
			rules: top.data.map(serializeBranch).filter(r => r !== null),
		};
	} else {
		const out: IFilter = {
			field: top.field,
		};
		if (top.filter) {
			out.filter = top.filter;
			out.value = top.value;
			out.type = top.type;
		}

		if (top.includes) out.includes = [...top.includes];
		if (top.predicate) out.predicate = top.predicate;

		if (top.filter && (!top.includes || !top.includes.length)) {
			const filter = getFilter(top.filter, top.type);
			if (!isValidFilter(top.value, filter.type)) return null;
		}

		return out;
	}
}

const validators: { [key: string]: (value: any) => boolean } = {
	[NumberFilters]: isNumber,
	[DateFilters]: isDate,
	[TextFilters]: () => true,
	[TupleFilters]: () => true,
};

function isValidFilter(value: any, type: string[]): boolean {
	for (let i = 0; i < type.length; i++) {
		if (validators[type[i]](value)) return true;
	}
	return false;
}

function isNumber(value: any): boolean {
	return !isNaN(parseFloat(value));
}

function isDate(value: any): boolean {
	return value && (value.start || value) instanceof Date;
}
