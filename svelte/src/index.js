import FilterBuilder from "./components/FilterBuilder.svelte";
import FilterEditor from "./components/editor/FilterEditor.svelte";
import FilterBar from "./components/bar/FilterBar.svelte";

import Material from "./themes/Material.svelte";
import Willow from "./themes/Willow.svelte";
import WillowDark from "./themes/WillowDark.svelte";

export {
	createArrayFilter,
	createFilter,
	getOptions,
	getOptionsMap,
	getFilter,
	getFilters,
	createFilterRule,
} from "wx-filter-store";

import { setEnv } from "wx-lib-dom";
import { env } from "wx-lib-svelte";
setEnv(env);

export { FilterBuilder, FilterEditor, FilterBar, Material, Willow, WillowDark };
