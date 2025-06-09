<script>
	import { Locale } from "wx-svelte-core";
	import { en } from "wx-filter-locales";
	import Layout from "./Layout.svelte";

	let { ...props } = $props();
</script>

<Locale words={en} optional={true}>
	<Layout {...props} />
</Locale>
