<script>
	import { getContext } from "svelte";

	const _ = getContext("wx-i18n").getGroup("filter");
	const api = getContext("filter-store");

	let { mode = "and", id } = $props();

	function toggleGlue() {
		api.exec("toggle-glue", { id });
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_interactive_supports_focus -->
<div class="wx-glue wx-{mode}" role="button" onclick={toggleGlue}>
	{_(mode)}
</div>

<style>
	.wx-glue {
		cursor: pointer;
		border-radius: var(--wx-line-height);
		display: inline-block;
		line-height: var(--wx-line-height);
		width: 40px;
		text-align: center;
		user-select: none;
	}

	.wx-glue:hover {
		background-image: linear-gradient(
			rgba(0, 0, 0, 0.1) 0%,
			rgba(0, 0, 0, 0.1) 100%
		);
	}

	.wx-and {
		background-color: var(--wx-filter-and-background);
		color: var(--wx-filter-and-font-color);
	}

	.wx-or {
		background-color: var(--wx-filter-or-background);
		color: var(--wx-filter-or-font-color);
	}
</style>
