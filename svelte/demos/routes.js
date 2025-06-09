import FilterBuilderBasic from "./cases/FilterBuilderBasic.svelte";
import FilterBuilderLine from "./cases/FilterBuilderLine.svelte";
import FilterBuilderSimple from "./cases/FilterBuilderSimple.svelte";
import FilterBuilderOptions from "./cases/FilterBuilderOptions.svelte";
import FilterBuilderDates from "./cases/FilterBuilderDates.svelte";
import FilterBuilderAPI from "./cases/FilterBuilderAPI.svelte";
import FilterBuilderLocales from "./cases/FilterBuilderLocales.svelte";
import FilterBuilderConvertDates from "./cases/FilterBuilderConvertDates.svelte";
import FilterBuilderBackend from "./cases/FilterBuilderBackend.svelte";
import FilterEditorBasic from "./cases/FilterEditorBasic.svelte";
import FilterEditorEvents from "./cases/FilterEditorEvents.svelte";
import FilterEditorFields from "./cases/FilterEditorFields.svelte";
import FilterEditorDates from "./cases/FilterEditorDates.svelte";
import FilterEditorOptions from "./cases/FilterEditorOptions.svelte";
import FilterBar from "./cases/FilterBar.svelte";
import FilterBarCombined from "./cases/FilterBarCombined.svelte";
import FilterBarDates from "./cases/FilterBarDates.svelte";

export const links = [
	["/base/:skin", "Basic Filter Builder", FilterBuilderBasic],
	[
		"/filter-builder-line/:skin",
		"Filter Builder: line mode",
		FilterBuilderLine,
	],
	[
		"/filter-builder-simple/:skin",
		"Filter Builder: simple mode",
		FilterBuilderSimple,
	],
	[
		"/filter-builder-options/:skin",
		"Filter Builder: dynamic options",
		FilterBuilderOptions,
	],
	[
		"/filter-builder-dates/:skin",
		"Filter Builder: working with dates",
		FilterBuilderDates,
	],
	["/filter-builder-api/:skin", "Filter Builder: API", FilterBuilderAPI],
	[
		"/filter-builder-locales/:skin",
		"Filter Builder: locales",
		FilterBuilderLocales,
	],
	[
		"/filter-builder-convert-dates/:skin",
		"Filter Builder: convert dates",
		FilterBuilderConvertDates,
	],
	[
		"/filter-builder-backend/:skin",
		"Filter Builder: backend",
		FilterBuilderBackend,
	],
	["/filter-editor-base/:skin", "Basic Filter Editor", FilterEditorBasic],
	[
		"/filter-editor-events/:skin",
		"Filter Editor: events",
		FilterEditorEvents,
	],
	[
		"/filter-editor-fields/:skin",
		"Filter Editor: multiple fields",
		FilterEditorFields,
	],
	[
		"/filter-editor-dates/:skin",
		"Filter Editor: working with dates",
		FilterEditorDates,
	],
	[
		"/filter-editor-options/:skin",
		"Filter Editor: formatting options",
		FilterEditorOptions,
	],
	["/filter-bar/:skin", "Basic Filter Bar", FilterBar],
	[
		"/filter-bar-combined/:skin",
		"Filter Bar: combined fields",
		FilterBarCombined,
	],
	[
		"/filter-bar-dates/:skin",
		"Filter Bar: working with dates",
		FilterBarDates,
	],
];
