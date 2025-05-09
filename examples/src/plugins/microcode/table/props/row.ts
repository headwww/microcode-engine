export default [
	{
		title: '行配置',
		name: 'rowConfig',
		display: 'entry',
		items: [
			{
				name: 'isCurrent',
				title: {
					label: '点击高亮',
					tip: '当鼠标点击行时，是否高亮当前行',
				},
				setter: {
					initialValue: true,
					componentName: 'BoolSetter',
				},
			},
			{
				name: 'isHover',
				title: {
					label: '悬浮高亮',
					tip: '当鼠标移到行时，是否高亮当前行',
				},
				setter: {
					initialValue: true,
					componentName: 'BoolSetter',
				},
			},
			{
				name: 'resizable',
				title: '行高调整',
				setter: {
					initialValue: true,
					componentName: 'BoolSetter',
				},
			},
			{
				name: 'drag',
				title: '拖拽',
				setter: {
					initialValue: true,
					componentName: 'BoolSetter',
				},
			},
			{
				name: 'beforeSelectMethod',
				title: {
					label: '拦截选中',
					tip: '拦截选中，返回false时，不选中',
				},
				setter: {
					componentName: 'FunctionSetter',
				},
			},
		],
	},
];
