<script>
	import {
		Globals,
		Willow,
		WillowDark,
		Locale,
		popupContainer,
	} from "wx-svelte-core";
	import ThemeSelect from "./ThemeSelect.svelte";
	import Main from "./Main.svelte";
	import {
		Willow as GridWillow,
		WillowDark as GridWillowDark,
	} from "wx-svelte-grid";

	let skin = $state("willow");
	let { themeSelect = false, border = false } = $props();
</script>

<Willow />
<WillowDark />
<GridWillow />
<GridWillowDark />

<div class="wx-{skin}-theme content" use:popupContainer>
	<Locale>
		<Globals>
			{#if themeSelect}
				<div class="demo" style="padding: 10px 0 0;">
					<div class="toolbar" style="padding: 0 20px;">
						<div class="control">
							<span>Theme</span>
							<ThemeSelect bind:value={skin} />
						</div>
					</div>
					<div class="bottom" class:border>
						<Main />
					</div>
				</div>
			{:else}
				<Main bind:skin />
			{/if}
		</Globals>
	</Locale>
</div>

<style>
	.content {
		height: 100%;
		width: 100%;
	}
	.demo {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}
	.bottom {
		flex: 1;
		height: 100%;
		overflow: hidden;
	}
	.toolbar {
		height: 32px;
		margin-bottom: 8px;
		display: flex;
		justify-content: flex-end;
	}
	.control {
		width: 212px;
		display: flex;
		gap: 8px;
		align-items: center;
	}
	.border {
		border: var(--wx-fm-grid-border);
	}
</style>
