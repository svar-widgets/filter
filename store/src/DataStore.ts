import { Store, EventBus, DataRouter, uid } from "wx-lib-state";
import type { TDataConfig, TWritableCreator, TID } from "wx-lib-state";
import RulesTree from "./RulesTree";

import type {
	IData,
	IDataConfig,
	TMethodsConfig,
	IFilter,
	IFilterSet,
	IDataFilter,
	IField,
	TOptions,
} from "./types";
import { getFilters } from "./filters";

export default class DataStore extends Store<IData> {
	public in: EventBus<IDataMethodsConfig, keyof IDataMethodsConfig>;
	private _router: DataRouter<IData, IDataConfig, IDataMethodsConfig>;

	constructor(w: TWritableCreator) {
		super({ writable: w, async: false });

		const inBus = (this.in = new EventBus());

		this._router = new DataRouter(
			super.setState.bind(this),
			// data recalculation dependencies
			[],
			// data initializers
			{
				value: (v: IFilter) => new RulesTree(v),
			}
		);

		inBus.on("edit-rule", ({ id }: TMethodsConfig["edit-rule"]) => {
			const { value, _editor: editor } = this.getState();
			if (editor && (!id || id != editor.id)) {
				const obj = value.byId(editor.id);

				if (obj.$temp || (!obj.includes && !obj.value)) {
					value.remove(editor.id);
					this.setState({ value });
				}
			}

			if (id) {
				this.setState({ _editor: { id } });
			} else {
				this.setState({ _editor: null });
			}
		});

		inBus.on("delete-rule", ({ id }: TMethodsConfig["delete-rule"]) => {
			const { value } = this.getState();
			if (!value.byId(id)) return;
			value.remove(id);

			this.onChange(value);
			this.setState({ value });
		});

		inBus.on(
			"add-rule",
			({ after, rule, edit }: TMethodsConfig["add-rule"]) => {
				const { value } = this.getState();

				if (!after && !rule.parent)
					rule.parent = value.getBranch(0)[0].id;

				value.addAfter(this._fixRule(rule), after);
				this.setState({ value });

				if (edit) inBus.exec("edit-rule", { id: rule.id });
			}
		);

		inBus.on(
			"add-group",
			({ after, rule, edit }: TMethodsConfig["add-group"]) => {
				const { value } = this.getState();

				const parent = { id: uid(), glue: "and" } as IDataFilter;
				value.addAfter(parent, after);

				rule = this._fixRule(rule);
				rule.parent = parent.id;
				value.add(rule, 0);

				this.setState({ value });

				if (edit) inBus.exec("edit-rule", { id: rule.id });
			}
		);

		inBus.on("toggle-glue", ({ id }: TMethodsConfig["toggle-glue"]) => {
			const { value } = this.getState();
			value.update(id, {
				glue: value.byId(id).glue === "and" ? "or" : "and",
			});

			this.onChange(value);
			this.setState({ value });
		});

		inBus.on(
			"update-rule",
			({ id, rule }: TMethodsConfig["update-rule"]) => {
				const { value } = this.getState();
				rule.$temp = false;
				value.update(id, rule);

				this.onChange(value);
				this.setState({ value });
			}
		);
	}

	onChange(data: RulesTree) {
		const value = data.serialize();
		this.in.exec("change", { value });
	}

	init(state: Partial<IDataConfig>) {
		state.value = this.normalizeValue(state.value, state.fields);
		state.options = this.normalizeOptions(state.options);
		this._router.init({ _editor: null, ...state });
	}

	setState(state: Partial<IData>, ctx?: TDataConfig) {
		return this._router.setState(state, ctx);
	}

	getValue() {
		return this.getState().value.serialize();
	}

	private normalizeOptions(options: TOptions) {
		if (typeof options === "function") return options;
		if (options && typeof options === "object")
			return (field: any) => options[field] || [];

		return null;
	}

	private normalizeValue(value: IFilterSet, fields: IField[]): IFilterSet {
		const normalized: IFilterSet = {
			glue: value.glue || "and",
			rules: value.rules
				? value.rules.map((rule: IFilter | IFilterSet) => {
						if ((rule as IFilter).field) {
							const fRule = rule as IFilter;
							const out: IFilter = { ...fRule };

							if (!out.type || !out.predicate) {
								const field = fields.find(
									f => f.id === fRule.field
								);
								out.type = fRule.type ?? field.type;
								if (field.predicate)
									out.predicate = field.predicate;
							}

							out.includes = fRule.includes
								? [...fRule.includes]
								: [];
							out.filter =
								fRule.filter ??
								getFilters(out.type).find(a => a.default).id;

							return out;
						}
						if ((rule as IFilterSet).rules)
							return this.normalizeValue(
								rule as IFilterSet,
								fields
							);
						return rule;
					})
				: [],
		};

		return normalized;
	}

	private _fixRule(obj: IDataFilter) {
		const { fields } = this.getState();

		obj.id = obj.id || uid();
		if (!obj.field) obj.field = fields[0].id;
		const f = fields.find(({ id }) => id === obj.field);

		if (!obj.filter) {
			obj.filter = getFilters(f.type).find(a => a.default).id;
			obj.type = f.type;
			obj.value = "";
		}
		if (!obj.predicate) {
			const predicate = fields.find(f => f.id === obj.field).predicate;
			if (predicate) obj.predicate = predicate;
		}
		if (!obj.includes) obj.includes = [];
		return obj;
	}
}

export interface IDataMethodsConfig {
	["add-rule"]: { rule: IDataFilter; edit: boolean; after?: TID };
	["add-group"]: { rule: IDataFilter; edit: boolean; after: TID };
	["edit-rule"]: { id?: TID };
	["update-rule"]: { id: TID; rule: IDataFilter };
	["delete-rule"]: { id: TID };
	["toggle-glue"]: { id: TID };
	["change-rule"]: { id: TID; rule: IDataFilter };
	["change"]: { value: IFilterSet };
}
