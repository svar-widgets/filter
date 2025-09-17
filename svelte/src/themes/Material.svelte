<script>
	import { Material } from "@svar-ui/svelte-core";
	let { fonts = true, children } = $props();
</script>

{#if children}
	<Material {fonts}>{@render children()}</Material>
{:else}
	<Material {fonts} />
{/if}

<style>
	:global(.wx-material-theme) {
		--wx-filter-value-color: var(--wx-color-primary);
		--wx-filter-and-background: #ffc975;
		--wx-filter-or-background: #00d19a;
		--wx-filter-and-font-color: var(--wx-color-font);
		--wx-filter-or-font-color: var(--wx-color-font);
		--wx-filter-border: var(--wx-border);
	}
</style>
