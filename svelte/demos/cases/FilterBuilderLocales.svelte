<script>
	import { getData } from "../data";
	import { FilterBuilder } from "../../src";
	import { Segmented, Locale } from "wx-svelte-core";

	import { en, de, cn } from "wx-filter-locales";
	import { en as coreEn, de as coreDe, cn as coreCn } from "wx-core-locales";

	const { value, fields, options } = getData();

	let lang = $state("en");
	const langs = [
		{ id: "en", label: "EN" },
		{ id: "cn", label: "CN" },
		{ id: "de", label: "DE" },
	];

	const getWords = lang => {
		let l;
		if (lang == "en") l = { ...coreEn, ...en };
		else if (lang == "cn") l = { ...coreCn, ...cn };
		else if (lang == "de") l = { ...coreDe, ...de };
		return l;
	};
</script>

<div class="rows">
	<div class="toolbar">
		<Segmented options={langs} bind:value={lang} />
	</div>
	<div style="padding: 10px 20px; width: 420px">
		<div class="qcell">
			{#key lang}
				<Locale words={getWords(lang)}>
					<FilterBuilder {value} {fields} {options} />
				</Locale>
			{/key}
		</div>
	</div>
</div>

<style>
	.toolbar {
		padding: 20px 10px 10px 20px;
	}
	.rows {
		position: relative;
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 100%;
		overflow: hidden;
	}
	.qcell {
		position: relative;
		height: 100%;
	}
</style>
