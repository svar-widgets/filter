<script>
	import { getData } from "../data";
	import { FilterBuilder } from "../../src";

	const { backendFields: fields, backendValue: value, columns } = getData();
	const server =
		"https://master--svar-query-go--dev.webix.io/api/data/persons";

	let data = $state([]);

	loadFilteredData(value);

	async function loadFilteredData(value) {
		const response = await fetch(`${server}`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(value),
		});

		data = await response.json();
	}

	async function provideOptions(fieldId) {
		const response = await fetch(`${server}/${fieldId}/suggest`);
		let options = await response.json();

		const field = fields.find(f => f.id === fieldId);
		if (field?.type === "date") {
			options = options.map(value => new Date(value));
		}

		return options;
	}

	function formatValue(value, column) {
		if (column.template) {
			return column.template(value);
		}
		return value;
	}
</script>

<div class="demo">
	<h4 style="margin: 20px 20px 0 20px;">
		Filtering server-side data with the rules created by FilterBuilder on
		the client-side
	</h4>
	<div class="layout">
		<div class="filter">
			<FilterBuilder
				{fields}
				{value}
				options={provideOptions}
				onchange={({ value }) => loadFilteredData(value)}
			/>
		</div>
		<div class="table-container">
			{#if data.length > 0}
				<table class="data-table">
					<thead>
						<tr>
							{#each columns as column}
								<th>{column.header}</th>
							{/each}
						</tr>
					</thead>
					<tbody>
						{#each data as row}
							<tr>
								{#each columns as column}
									<td
										>{formatValue(
											row[column.id],
											column
										)}</td
									>
								{/each}
							</tr>
						{/each}
					</tbody>
				</table>
			{:else}
				<div class="empty-state">No data available</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.demo {
		height: calc(100vh - 70px);
		display: flex;
		flex-direction: column;
	}
	.layout {
		display: flex;
		flex-grow: 1;
		min-height: 600px;
		padding: 20px;
		gap: 20px;
	}
	.filter {
		width: 320px;
	}
	.table-container {
		width: calc(100% - 340px);
		max-height: 100%;
		overflow-y: auto;
		overflow-x: hidden;
		border: var(--wx-border);
		border-top: none;
		box-sizing: border-box;
	}
	:global(.wx-willow-theme) {
		--wx-table-header-background: #f2f3f7;
	}
	:global(.wx-willow-dark-theme) {
		--wx-table-header-background: #20262b;
	}
	.data-table {
		width: 100%;
		border-collapse: separate;
		border-spacing: 0;
		background: var(--wx-background);
		table-layout: fixed;
	}
	.data-table th:not(:last-child),
	.data-table td:not(:last-child) {
		border-right: var(--wx-border);
	}
	.data-table th:first-child,
	.data-table td:first-child {
		border-left: none;
	}
	.data-table th {
		background-color: var(--wx-table-header-background) !important;
		box-sizing: border-box;
		padding: 8px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		color: var(--wx-color-font);
		border-top: var(--wx-border);
		border-bottom: var(--wx-border);
		position: sticky;
		top: 0;
		z-index: 10;
		font-weight: 600;
	}
	.data-table td {
		background: var(--wx-background);
		box-sizing: border-box;
		padding: 8px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		color: var(--wx-color-font);
		border-bottom: var(--wx-border);
	}
	.empty-state {
		padding: 40px;
		text-align: center;
		color: #999;
		font-style: italic;
	}
</style>
