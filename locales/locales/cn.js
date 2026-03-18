export default {
	filter: {
		"Add filter": "添加过滤器",
		"Add group": "添加组",
		Edit: "编辑",
		Delete: "删除",

		"Select all": "全选",
		"Unselect all": "取消全选",

		Cancel: "取消",
		Apply: "应用",

		and: "与",
		or: "或",
		in: "在",

		equal: "等于",
		"not equal": "不等于",
		contains: "包含",
		"not contains": "不包含",
		"begins with": "开始于",
		"not begins with": "不开始于",
		"ends with": "结束于",
		"not ends with": "不结束于",

		greater: "大于",
		"greater or equal": "大于或等于",
		less: "小于",
		"less or equal": "小于或等于",
		between: "在之间",
		"not between": "不在之间",

		"Click to select": "點擊選擇",
		None: "無",
		"filter by": "過濾依據",

		unknown_field: field => `未知字段"${field}"`,
		expected_number: (field, value) =>
			`"${field}"应为数字，实际为"${value}"`,
		expected_date: (field, value) =>
			`"${field}"应为日期（YYYY-MM-DD），实际为"${value}"`,
		no_data: (field, value) => `"${field}"中没有匹配"${value}"的数据`,
	},
};
