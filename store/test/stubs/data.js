export function getFilterA1() {
	return {
		id: "root",
		glue: "or",
		rules: [
			{
				field: "first_name",
				filter: "equal",
				value: "Alex",
			},
			{
				field: "first_name",
				filter: "equal",
				value: "Daisy",
			},
			{
				glue: "and",
				rules: [
					{
						field: "age",
						filter: "less",
						value: 40,
					},
					{
						field: "age",
						filter: "greater",
						value: 30,
					},
				],
			},
		],
	};
}

export const getData = type => {
	if (!type) type = "default";
	return values[type];
};

export const fields = [
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
		id: "start",
		label: "Start Date",
		type: "date",
	},
];

export const listData = [
	{
		id: 1,
		first_name: "Alex",
		last_name: "Wonski",
		age: 26,
		start: new Date(2025, 0, 3),
	},
	{
		id: 2,
		first_name: "Alex",
		last_name: "Kareki",
		age: 45,
		start: new Date(2025, 2, 13),
	},
	{
		id: 3,
		first_name: "Agata",
		last_name: "Smith",
		age: 35,
		start: new Date(2025, 2, 8),
	},
	{
		id: 4,
		first_name: "Daisy",
		last_name: "Bounce",
		age: 33,
		start: new Date(2024, 11, 4),
	},
	{
		id: 5,
		first_name: "John",
		last_name: "Wane",
		age: 24,
		start: new Date(2025, 1, 1),
	},
	{
		id: 6,
		first_name: "Jane",
		last_name: "Wane",
		age: 44,
		start: new Date(2024, 9, 2),
	},
];

export const options = {
	first_name: ["Agata", "Alex", "Daisy", "Jane", "John"],
	last_name: ["Wonski", "Kareki", "Smith", "Bounce", "Wane"],
	age: [24, 26, 33, 35, 44, 45],
	start: [
		new Date(2024, 9, 2),
		new Date(2024, 11, 4),
		new Date(2025, 0, 3),
		new Date(2025, 1, 1),
		new Date(2025, 2, 8),
		new Date(2025, 2, 13),
	],
};

const values = {
	default: {
		value: {
			glue: "or",
			rules: [
				{
					field: "first_name",
					filter: "equal",
					value: "Alex",
				},
				{
					field: "first_name",
					filter: "equal",
					value: "Daisy",
				},
				{
					glue: "and",
					rules: [
						{
							field: "age",
							filter: "less",
							value: 45,
						},
						{
							field: "age",
							filter: "greater",
							value: 40,
						},
					],
				},
			],
		},
		fields,
		options,
	},
	empty: {
		value: {
			glue: "and",
			rules: [],
		},
		fields,
		options,
	},
};
