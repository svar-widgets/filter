<script lang="ts">
	// svelte core
	import { setContext } from "svelte";
	import { writable } from "svelte/store";

	// components
	import Layout from "./Layout.svelte";

	// core widgets lib
	import { Locale } from "@svar-ui/svelte-core";
	import { en } from "@svar-ui/filter-locales";

	// stores
	import { EventBusRouter } from "@svar-ui/lib-state";
	import type { IEventBus } from "@svar-ui/lib-state";
	import { DataStore } from "@svar-ui/filter-store";
	import type {
		IApi,
		IField,
		IFilterSet,
		TMethodsConfig,
		TOptions,
	} from "@svar-ui/filter-store";
	import type { FilterBuilderActions, IFilterContext } from "../types";

	type Props = {
		value?: IFilterSet;
		fields?: IField[];
		options?: TOptions | null;
		type?: "list" | "line" | "simple";
		init?: ((api: IApi) => void) | null;
	} & FilterBuilderActions;

	let {
		value = { glue: "and", rules: [] },
		fields = [],
		options = null,
		type = "list",
		init = null,
		...restProps
	}: Props = $props();

	// init stores
	const dataStore = new DataStore(writable);

	// define event route
	let firstInRoute = dataStore.in;

	const dash = /-/g;
	let lastInRoute: IEventBus<TMethodsConfig> =
		new EventBusRouter<TMethodsConfig>((a, b) => {
			const name = `on${String(a).replace(dash, "")}` as const;
			if (restProps[name]) {
				restProps[name](b);
			}
		});
	firstInRoute.setNext(lastInRoute);

	// public API
	// EventBus types every handler with the union of all actions,
	// so the event methods are cast to the per-action IApi signatures
	export const // state
		getState: IApi["getState"] = dataStore.getState.bind(dataStore),
		getReactiveState = dataStore.getReactive.bind(
			dataStore
		) as IApi["getReactiveState"],
		getStores: IApi["getStores"] = () => ({ data: dataStore }),
		// events
		exec = firstInRoute.exec as unknown as IApi["exec"],
		setNext: IApi["setNext"] = ev =>
			(lastInRoute = lastInRoute.setNext(ev)),
		intercept = firstInRoute.intercept.bind(
			firstInRoute
		) as unknown as IApi["intercept"],
		on = firstInRoute.on.bind(firstInRoute) as unknown as IApi["on"],
		detach = firstInRoute.detach.bind(
			firstInRoute
		) as unknown as IApi["detach"],
		getValue: IApi["getValue"] = dataStore.getValue.bind(dataStore);

	const api: IApi = {
		exec,
		setNext,
		intercept,
		on,
		detach,
		getState,
		getReactiveState,
		getStores,
		getValue,
	};

	// common API available in components
	setContext<IFilterContext>("filter-store", {
		getState: dataStore.getState.bind(dataStore),
		getReactiveState: dataStore.getReactive.bind(
			dataStore
		) as IApi["getReactiveState"],
		exec: firstInRoute.exec.bind(firstInRoute) as unknown as IApi["exec"],
	});

	let init_once = true;
	const reinitStore = () => {
		dataStore.init({
			value,
			fields,
			options,
		});

		if (init_once && init) {
			init(api);
			init_once = false;
		}
	};
	reinitStore();
	$effect(reinitStore);
</script>

<Locale words={en} optional={true}>
	<Layout {type} />
</Locale>
