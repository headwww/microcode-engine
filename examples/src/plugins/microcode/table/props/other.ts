export default [
	{
		title: '外观',
		display: 'entry',
		name: 'otherConfig',
		type: 'group',
		items: [
			{
				name: 'stripe',
				title: {
					label: '斑马线',
					tip: '数据行与行之间是否显示斑马线',
				},
				setter: {
					initialValue: true,
					componentName: 'BoolSetter',
				},
			},
			{
				name: 'showOverflow',
				title: {
					label: '显示溢出',
					tip: '开启后，表格文本超出会溢出模式，建议开启优化渲染性能',
				},
				setter: {
					initialValue: true,
					componentName: 'BoolSetter',
				},
			},
			{
				name: 'virtualScroll',
				title: {
					label: '虚拟滚动',
					tip: '开启后，表格会使用虚拟滚动，建议开启优化渲染性能',
				},
				setter: {
					initialValue: true,
					componentName: 'BoolSetter',
				},
				extraProps: {
					setValue: (target: any, value: string) => {
						if (value) {
							target.node.setPropValue('showOverflow', true);
						}
					},
				},
			},
			{
				name: 'round',
				title: '圆角',
				setter: {
					initialValue: true,
					componentName: 'BoolSetter',
				},
			},
			{
				name: 'border',
				title: '边框',
				setter: {
					initialValue: 'full',
					componentName: 'SelectSetter',
					props: {
						options: [
							{
								title: '默认',
								value: 'default',
							},
							{
								title: '完整边框',
								value: 'full',
							},
							{
								title: '外边框',
								value: 'outer',
							},
							{
								title: '内边框',
								value: 'inner',
							},
							{
								title: '隐藏边框',
								value: 'none',
							},
						],
					},
				},
			},
			{
				name: 'size',
				title: '尺寸',
				setter: {
					initialValue: 'mini',
					componentName: 'SegmentedSetter',
					props: {
						options: [
							{
								label: '小',
								value: 'mini',
							},
							{
								label: '中',
								value: 'medium',
							},
							{
								label: '大',
								value: 'large',
							},
						],
					},
				},
			},
			{
				name: 'align',
				title: '对齐方式',
				setter: {
					initialValue: 'left',
					componentName: 'SegmentedSetter',
					props: {
						options: [
							{
								label: '左',
								value: 'left',
							},
							{
								label: '剧中',
								value: 'center',
							},
							{
								label: '右',
								value: 'right',
							},
						],
					},
				},
			},
		],
	},
];
