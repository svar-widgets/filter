<script>
	// svelte core
	import { setContext } from "svelte";
	import { writable } from "svelte/store";

	// components
	import Layout from "./Layout.svelte";

	// core widgets lib
	import { Locale } from "wx-svelte-core";
	import { en } from "wx-filter-locales";

	// stores
	import { EventBusRouter } from "wx-lib-state";
	import { DataStore } from "wx-filter-store";

	let {
		value = { glue: "and", rules: [] },
		fields = [],
		options = null,
		type = "list",
		init = null,
		...restProps
	} = $props();

	// init stores
	const dataStore = new DataStore(writable);

	// define event route
	let firstInRoute = dataStore.in;

	const dash = /-/g;
	let lastInRoute = new EventBusRouter((a, b) => {
		const name = "on" + a.replace(dash, "");
		if (restProps[name]) {
			restProps[name](b);
		}
	});
	firstInRoute.setNext(lastInRoute);

	// public API
	export const // state
		getState = dataStore.getState.bind(dataStore),
		getReactiveState = dataStore.getReactive.bind(dataStore),
		getStores = () => ({ data: dataStore }),
		// events
		exec = firstInRoute.exec,
		setNext = ev => (lastInRoute = lastInRoute.setNext(ev)),
		intercept = firstInRoute.intercept.bind(firstInRoute),
		on = firstInRoute.on.bind(firstInRoute),
		detach = firstInRoute.detach.bind(firstInRoute),
		getValue = dataStore.getValue.bind(dataStore);

	const api = {
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
	setContext("filter-store", {
		getState: dataStore.getState.bind(dataStore),
		getReactiveState: dataStore.getReactive.bind(dataStore),
		exec: firstInRoute.exec.bind(firstInRoute),
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
