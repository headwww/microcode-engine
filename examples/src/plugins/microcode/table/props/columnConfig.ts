export default [
	{
		title: '列配置信息',
		name: 'columnConfig',
		display: 'entry',
		items: [
			{
				name: 'drag',
				title: '列拖拽',
				setter: {
					initialValue: true,
					componentName: 'BoolSetter',
				},
			},
			{
				name: 'resizable',
				title: '列宽调整',
				setter: {
					initialValue: true,
					componentName: 'BoolSetter',
				},
			},
			{
				name: 'isCurrent',
				title: {
					label: '点击高亮',
					tip: '当鼠标点击列头时，是否高亮当前列',
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
					tip: '当鼠标移到列头时，是否高亮当前列',
				},
				setter: {
					initialValue: true,
					componentName: 'BoolSetter',
				},
			},
		],
	},
];
