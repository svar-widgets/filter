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
	};
}

export const fields = [
	{
		id: "first_name",
		value: "First Name",
		type: "text",
	},
	{
		id: "age",
		value: "Age",
		type: "number",
	},
];

export const listData = [
	{
		first_name: "Alex",
		last_name: "Wonski",
		age: 26,
		start: new Date(2018, 1, 3),
	},
	{
		first_name: "Alex",
		last_name: "Kareki",
		age: 45,
		start: new Date(2016, 2, 13),
	},
	{
		first_name: "Agata",
		last_name: "Smith",
		age: 35,
		start: new Date(2018, 2, 8),
	},
	{
		first_name: "Daisy",
		last_name: "Bounce",
		age: 33,
		start: new Date(2017, 11, 4),
	},
	{
		first_name: "John",
		last_name: "Wane",
		age: 24,
		start: new Date(2019, 10, 1),
	},
	{
		first_name: "Jane",
		last_name: "Wane",
		age: 44,
		start: new Date(2018, 9, 2),
	},
];
