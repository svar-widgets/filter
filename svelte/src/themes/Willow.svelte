<script>
	import { Willow } from "@svar-ui/svelte-core";
	let { fonts = true, children } = $props();
</script>

{#if children}
	<Willow {fonts}>{@render children()}</Willow>
{:else}
	<Willow {fonts} />
{/if}

<style>
	:global(.wx-willow-theme) {
		--wx-filter-value-color: var(--wx-color-primary);
		--wx-filter-and-background: #fcba2e;
		--wx-filter-or-background: #77d257;
		--wx-filter-and-font-color: var(--wx-color-font);
		--wx-filter-or-font-color: var(--wx-color-font);
		--wx-filter-border: 1px solid #e6e6e6;
	}
</style>
