<script>
	import { Locale } from "@svar-ui/svelte-core";
	import { en } from "@svar-ui/filter-locales";
	import Layout from "./Layout.svelte";

	let { ...props } = $props();
</script>

<Locale words={en} optional={true}>
	<Layout {...props} />
</Locale>
