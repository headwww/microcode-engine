export default [
	{
		title: {
			label: '动态样式',
			tip: '当需要设置一些上下线等问题的时候可以使用该配置',
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
