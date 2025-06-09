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
		],
	};

	const fields = [
		{
			id: "first_name",
			label: "First Name",
			type: "text",
		},
		{
			id: "age",
			label: "Age",
			type: "number",
		},
		{
			id: "start",
			label: "Start Date",
			type: "date",
		},
	];

	const options = {
		first_name: ["Alex", "Agata", "Daisy", "John", "Jane", "Willi"],
		age: [24, 26, 33, 35, 44, 45, 62],
		start: [
			new Date(2024, 9, 2),
			new Date(2024, 11, 4),
			new Date(2025, 0, 3),
			new Date(2025, 1, 1),
			new Date(2025, 1, 22),
			new Date(2025, 2, 8),
			new Date(2025, 2, 13),
		],
		country: ["USA", "China", "Germany"],
	};

	const data = [
		{
			first_name: "Alex",
			last_name: "Wonski",
			country: "USA",
			age: 26,
			start: new Date(2025, 0, 3),
		},
		{
			first_name: "Alex",
			last_name: "Kareki",
			country: "Germany",
			age: 45,
			start: new Date(2025, 2, 13),
		},
		{
			first_name: "Agata",
			last_name: "Smith",
			country: "USA",
			age: 35,
			start: new Date(2025, 2, 8),
		},
		{
			first_name: "Daisy",
			last_name: "Bounce",
			country: "Germany",
			age: 33,
			start: new Date(2024, 11, 4),
		},
		{
			first_name: "John",
			last_name: "Wane",
			country: "USA",
			age: 24,
			start: new Date(2025, 1, 1),
		},
		{
			first_name: "Jane",
			last_name: "Wane",
			country: "USA",
			age: 44,
			start: new Date(2024, 9, 2),
		},
		{
			first_name: "Willi",
			last_name: "Wong",
			country: "China",
			age: 62,
			start: new Date(2025, 1, 22),
		},
	];

	return { fields, value, options, data };
}
