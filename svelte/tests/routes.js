import FilterBuilderValue from "./cases/FilterBuilderValue.svelte";
import FilterBuilderEmpty from "./cases/FilterBuilderEmpty.svelte";
import FilterBuilderSimpleValue from "./cases/FilterBuilderSimpleValue.svelte";
import FilterBuilderLineValue from "./cases/FilterBuilderLineValue.svelte";
import FilterBuilderSimpleEmpty from "./cases/FilterBuilderSimpleEmpty.svelte";
import FilterBarDynamic from "./cases/FilterBarDynamic.svelte";
import FilterEditorFields from "./cases/FilterEditorFields.svelte";

export const links = [
	["/filter-builder-value", "", FilterBuilderValue],
	["/filter-builder-simple-value", "", FilterBuilderSimpleValue],
	["/filter-builder-line-value", "", FilterBuilderLineValue],
	["/filter-builder-empty", "", FilterBuilderEmpty],
	["/filter-builder-simple-empty", "", FilterBuilderSimpleEmpty],
	["/filter-bar-dynamic", "", FilterBarDynamic],
	["/filter-editor-fields", "", FilterEditorFields],
];
