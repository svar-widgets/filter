export function getData() {
	const value = {
		glue: "or",
		rules: [
			{
				field: "first_name",
				filter: "equal",
				value: "Alex",
			},
			{
				field: "first_name",
				includes: ["Daisy"],
			},
			{
				glue: "and",
				rules: [
					{
						field: "age",
						filter: "greater",
						value: 40,
					},
					{
						field: "age",
						filter: "less",
						value: 60,
					},
				],
			},
			{
				field: "start",
				filter: "between",
				type: "date",
				value: {
					start: new Date("2024-11-01"),
					end: new Date("2025-05-01"),
				},
			},
		],
	};

	const fields = [
		{
			id: "first_name",
			label: "First Name",
			type: "text",
		},
		{
			id: "last_name",
			label: "Last Name",
			type: "text",
		},
		{
			id: "age",
			label: "Age",
			type: "number",
		},
		{
			id: "country",
			label: "Country",
			type: "text",
		},
		{
			id: "start",
			label: "Start Date",
			type: "date",
		},
		{
			id: "end",
			label: "End Date",
			type: "date",
		},
	];

	const values = [
		{ includes: ["Daisy"] },
		{ filter: "less", value: 25 },
		{ filter: "less", value: new Date(2025, 4, 7) },
	];

	const options = {
		first_name: [
			"Alex",
			"Adam",
			"Agata",
			"Daisy",
			"John",
			"Jane",
			"Elena",
			"Felix",
			"Rachel",
			"Willi",
		],
		last_name: [
			"Wonski",
			"Kareki",
			"Smith",
			"Bounce",
			"Wane",
			"Wane",
			"Wong",
		],
		age: [24, 26, 33, 35, 44, 45, 62],
		country: ["USA", "China", "Germany"],
		start: [
			new Date(2024, 9, 2),
			new Date(2024, 11, 4),
			new Date(2025, 0, 3),
			new Date(2025, 1, 1),
			new Date(2025, 1, 22),
			new Date(2025, 2, 8),
			new Date(2025, 2, 13),
		],
		end: [
			new Date(2024, 9, 9),
			new Date(2024, 11, 11),
			new Date(2025, 0, 10),
			new Date(2025, 1, 8),
			new Date(2025, 1, 29),
			new Date(2025, 2, 15),
			new Date(2025, 2, 20),
		],
	};

	const data = [
		{
			first_name: "Alex",
			last_name: "Wonski",
			country: "USA",
			age: 26,
			start: new Date(2025, 0, 3),
			end: new Date(2025, 0, 10),
		},
		{
			first_name: "Alex",
			last_name: "Kareki",
			country: "Germany",
			age: 45,
			start: new Date(2025, 2, 13),
			end: new Date(2025, 2, 20),
		},
		{
			first_name: "Agata",
			last_name: "Smith",
			country: "USA",
			age: 35,
			start: new Date(2025, 2, 8),
			end: new Date(2025, 2, 15),
		},
		{
			first_name: "Daisy",
			last_name: "Bounce",
			country: "Germany",
			age: 33,
			start: new Date(2024, 11, 4),
			end: new Date(2024, 11, 11),
		},
		{
			first_name: "John",
			last_name: "Wane",
			country: "USA",
			age: 24,
			start: new Date(2025, 1, 1),
			end: new Date(2025, 1, 8),
		},
		{
			first_name: "Jane",
			last_name: "Wane",
			country: "USA",
			age: 44,
			start: new Date(2024, 9, 2),
			end: new Date(2024, 9, 9),
		},
		{
			first_name: "Willi",
			last_name: "Wong",
			country: "China",
			age: 62,
			start: new Date(2025, 1, 22),
			end: new Date(2025, 1, 29),
		},
	];

	const simpleValue = {
		rules: [
			{
				field: "first_name",
				filter: "equal",
				value: "Alex",
			},
			{
				field: "last_name",
				includes: ["Wong", "Wonski"],
			},
		],
	};

	const backendFields = [
		{
			id: "first_name",
			label: "First Name",
			type: "text",
		},
		{
			id: "last_name",
			label: "Last Name",
			type: "text",
		},
		{
			id: "age",
			label: "Age",
			type: "number",
		},
		{
			id: "birthdate",
			label: "Birth date",
			type: "date",
		},
		{
			id: "country",
			label: "Country",
			type: "text",
		},
		{
			id: "job",
			label: "Job",
			type: "text",
		},
	];

	const backendValue = {
		glue: "or",
		rules: [
			{
				field: "first_name",
				filter: "beginsWith",
				value: "A",
			},
		],
	};

	const columns = [
		{
			id: "first_name",
			header: "First Name",
			flexgrow: 1,
		},
		{
			id: "last_name",
			header: "Last Name",
			flexgrow: 1,
		},
		{
			id: "birthdate",
			header: "Birth Date",
			template: value =>
				value ? new Date(value).toLocaleDateString() : "",
			flexgrow: 1,
		},
		{
			id: "age",
			header: "Age",
			flexgrow: 1,
		},
		{
			id: "country",
			header: "Country",
			flexgrow: 1,
		},
		{
			id: "city",
			header: "City",
			flexgrow: 1,
		},
		{
			id: "job",
			header: "Job",
		},
	];

	return {
		fields,
		value,
		values,
		options,
		data,
		simpleValue,
		backendFields,
		backendValue,
		columns,
	};
}
