<!--
	Keyboard-navigable autocomplete dropdown.
	navIndex=-1 means no selection; Enter closes without selecting in this state.
-->
<script>
	import { Dropdown } from "@svar-ui/svelte-core";
	import { locateID } from "@svar-ui/lib-dom";

	let { items = [], children, onselect, onclose } = $props();

	let list = $state(null);
	let navIndex = $state(-1);

	function setNav(index) {
		navIndex = index;
	}

	function navigate(dir) {
		let index;
		if (navIndex === -1) {
			// First navigation: ArrowDown→first item, ArrowUp→last item
			index = dir > 0 ? 0 : items.length - 1;
		} else {
			index = Math.max(0, Math.min(navIndex + dir, items.length - 1));
		}
		if (index === navIndex) return;
		setNav(index);
		scrollToIndex(index);
	}

	function scrollToIndex(index) {
		if (index >= 0 && list) {
			const el = list.querySelectorAll(".wx-item")[index];
			if (el) {
				el.scrollIntoView({ block: "nearest" });
			}
		}
	}

	function handleMove(ev) {
		const id = locateID(ev);
		const index = items.findIndex(a => a.id == id);
		if (index !== -1 && index !== navIndex) {
			setNav(index);
		}
	}

	export function keydown(ev) {
		if (!items.length) return;

		switch (ev.code) {
			case "Enter":
				if (navIndex >= 0) {
					ev.preventDefault();
					onselect && onselect({ id: items[navIndex].id });
				} else {
					onclose && onclose();
				}
				break;
			case "Escape":
			case "Tab":
				onclose && onclose();
				break;
			case "ArrowDown":
				ev.preventDefault();
				navigate(1);
				break;
			case "ArrowUp":
				ev.preventDefault();
				navigate(-1);
				break;
		}
	}

	function handleClick(ev) {
		ev.stopPropagation();
		const id = locateID(ev);
		const item = items.find(a => a.id == id);
		if (item) {
			onselect && onselect({ id: item.id });
		}
	}

	// Reset selection when items change to avoid stale index
	$effect(() => {
		if (!list || !items.length) {
			navIndex = -1;
		}
	});
</script>

{#if items.length > 0}
	<Dropdown oncancel={onclose}>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="wx-list"
			bind:this={list}
			onclick={handleClick}
			onmousemove={handleMove}
		>
			{#each items as data, index (data.id)}
				<div
					class="wx-item"
					class:wx-focus={index === navIndex}
					data-id={data.id}
				>
					{#if children}{@render children({
							option: data,
						})}{:else}{data.label}{/if}
				</div>
			{/each}
		</div>
	</Dropdown>
{/if}

<style>
	.wx-list {
		max-height: 250px;
		overflow-y: auto;
	}

	.wx-item {
		display: flex;
		flex-wrap: nowrap;
		align-items: center;
		font-family: var(--wx-input-font-family);
		font-size: var(--wx-input-font-size);
		line-height: var(--wx-input-line-height);
		font-weight: var(--wx-input-font-weight);
		color: var(--wx-input-font-color);
		padding: var(--wx-input-padding);
		cursor: pointer;
	}

	.wx-item.wx-focus {
		background: var(--wx-background-hover);
	}
</style>
