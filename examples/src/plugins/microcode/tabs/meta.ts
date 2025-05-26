export default {
	componentName: 'Tabs',
	title: '选项卡',
	category: '布局',
	group: '基础组件',
	npm: {
		package: 'ArvinMicrocode',
		destructuring: true,
		exportName: 'Tabs',
		version: '1.0.0',
	},
	configure: {
		component: {
			isContainer: true,
		},
		props: [
			{
				name: 'items',
				title: '标签项',
				setter: {
					componentName: 'ArraySetter',
					props: {
						itemSetter: {
							componentName: 'ObjectSetter',
							props: {
								config: {
									items: [
										{
											name: 'key',
											title: 'key',
											setter: 'StringSetter',
											initialValue: (val: any) =>
												val ||
												`tab-item-${((Math.random() * 1e6) >> 0).toString(36)}`,
											supportVariable: true,
										},
										{
											name: 'label',
											title: '名称',
											initialValue: '标签项',
											setter: 'StringSetter',
											important: true,
											supportVariable: true,
										},
										{
											name: 'children',
											title: '内容',
											setter: {
												componentName: 'SlotSetter',
												initialValue: {
													type: 'JSSlot',
													value: [],
												},
											},
										},
									],
								},
							},
							initialValue: () => ({
								key: `tab-item-${((Math.random() * 1e6) >> 0).toString(36)}`,
								label: '标签项',
								children: {
									type: 'JSSlot',
									value: [],
								},
							}),
						},
					},
				},
			},
			{
				name: 'defaultActiveKey',
				title: {
					label: '初始选中',
					tip: '初始化选中面板的key，如果没有设置activeKey',
				},
				setter: 'StringSetter',
				supportVariable: true,
			},
			{
				name: 'full',
				title: {
					label: '自适应',
					tip: 'tabs的pane不自带100%，开启后，pane会自适应100%',
				},
				setter: {
					componentName: 'BoolSetter',
					initialValue: true,
				},
			},
			{
				name: 'size',
				title: {
					label: '尺寸',
					tip: '大小，提供 `large` `default` 和 `small` 三种大小',
				},
				setter: {
					initialValue: 'middle',
					componentName: 'SegmentedSetter',
					props: {
						options: [
							{ label: '小', value: 'small' },
							{ label: '中', value: 'middle' },
							{ label: '大', value: 'large' },
						],
					},
				},
			},
			{
				name: 'onChange',
				title: { label: '切换面板的回调	', tip: '切换面板的回调	' },
				setter: {
					componentName: 'FunctionSetter',
				},
			},
			{
				name: 'onTabClick',
				title: { label: 'tab点击回调', tip: 'tab被点击的回调' },
				setter: {
					componentName: 'FunctionSetter',
				},
			},
		],
	},
	snippets: [
		{
			title: '选项卡',
			schema: {
				componentName: 'Tabs',
				props: {
					items: [
						{
							label: '标签项1',
							key: 'tab-item-1',
							children: {
								type: 'JSSlot',
								value: [],
							},
						},
						{
							label: '标签项2',
							key: 'tab-item-2',
							children: {
								type: 'JSSlot',
								value: [],
							},
						},
					],
				},
			},
		},
	],
};
