export default [
	{
		title: {
			label: '动态样式',
			tip: '给表格行或者单元格添加动态样式',
		},
		display: 'entry',
		type: 'group',
		name: 'styleConfig',
		items: [
			{
				name: 'rowStyle',
				title: '行样式',
				setter: {
					componentName: 'FunctionSetter',
				},
			},
			{
				name: 'cellStyle',
				title: '单元格样式',
				setter: {
					componentName: 'FunctionSetter',
				},
			},
		],
	},
];
