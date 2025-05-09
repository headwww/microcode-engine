export default [
	{
		name: 'pagerConfig',
		title: {
			label: '分页配置',
			tip: '分页配置, 用于配置分页信息',
		},
		display: 'entry',
		items: [
			{
				name: 'enabled',
				title: {
					label: '是否启用',
				},
				setter: {
					initialValue: false,
					componentName: 'BoolSetter',
				},
			},
			{
				name: 'pageSize',
				title: {
					label: '每页大小',
				},
				condition: (target: any) =>
					!!target.getParent().getPropValue('enabled'),
				setter: {
					initialValue: 50,
					componentName: 'NumberSetter',
				},
			},
			{
				name: 'pageSizes',
				title: {
					label: '每页大小选项列表',
				},
				condition: (target: any) =>
					!!target.getParent().getPropValue('enabled'),
				setter: {
					initialValue: [
						10,
						20,
						50,
						100,
						200,
						500,
						{ label: '全量数据', value: -1 },
					],
					componentName: 'JsonSetter',
				},
			},
			{
				name: 'onPageChange',
				title: {
					label: '分页事件',
				},
				condition: (target: any) =>
					!!target.getParent().getPropValue('enabled'),
				setter: {
					componentName: 'FunctionSetter',
				},
			},
		],
	},
];
