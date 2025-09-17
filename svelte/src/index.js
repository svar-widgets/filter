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
} from "@svar-ui/filter-store";

import { setEnv } from "@svar-ui/lib-dom";
import { env } from "@svar-ui/lib-svelte";
setEnv(env);

export { FilterBuilder, FilterEditor, FilterBar, Material, Willow, WillowDark };
