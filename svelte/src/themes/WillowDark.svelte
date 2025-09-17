<script>
	import { WillowDark } from "@svar-ui/svelte-core";
	let { fonts = true, children } = $props();
</script>

{#if children}
	<WillowDark {fonts}>{@render children()}</WillowDark>
{:else}
	<WillowDark {fonts} />
{/if}

<style>
	:global(.wx-willow-dark-theme) {
		color-scheme: dark;

		--wx-filter-value-color: #ac9eff;
		--wx-filter-and-background: #fcba2e;
		--wx-filter-or-background: #77d257;
		--wx-filter-and-font-color: #000000b3;
		--wx-filter-or-font-color: #000000b3;
		--wx-filter-border: var(--wx-border);
	}
</style>
