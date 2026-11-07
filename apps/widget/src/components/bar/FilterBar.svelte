<script lang="ts">
	import type { ComponentProps } from "svelte";
	import { Locale } from "@svar-ui/svelte-core";
	import { en } from "@svar-ui/filter-locales";
	import Layout from "./Layout.svelte";

	type Props = ComponentProps<typeof Layout>;

	let { ...props }: Props = $props();
</script>

<Locale words={en} optional={true}>
	<Layout {...props} />
</Locale>
