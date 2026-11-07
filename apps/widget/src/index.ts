export { default as FilterBuilder } from "./components/FilterBuilder.svelte";
export { default as FilterEditor } from "./components/editor/FilterEditor.svelte";
export { default as FilterBar } from "./components/bar/FilterBar.svelte";
export { default as FilterQuery } from "./components/FilterQuery.svelte";
export { default as Willow } from "./themes/Willow.svelte";
export { default as WillowDark } from "./themes/WillowDark.svelte";

export {
	createArrayFilter,
	createFilter,
	getOptions,
	getOptionsMap,
	getFilter,
	getFilters,
	getQueryHtml,
	createFilterRule,
	serialize as getQueryString,
} from "@svar-ui/filter-store";

import { setEnv } from "@svar-ui/lib-dom";
import { env } from "@svar-ui/lib-svelte";
setEnv(env);

export type * from "@svar-ui/filter-store";
export type {
	FilterBuilderActions,
	IFilterBarGroup,
	TFilterBarField,
	FilterQueryEvent,
	TFilterQueryParse,
} from "./types";
