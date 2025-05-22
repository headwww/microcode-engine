export default {
	componentName: 'Split',
	title: '分割器',
	category: '布局',
	group: '基础组件',
	npm: {
		package: 'ArvinMicrocode',
		destructuring: true,
		exportName: 'Split',
		version: '1.0.0',
	},
	props: [],
	configure: {
		component: {
			isContainer: true,
		},
		props: [
			{
				name: 'vertical',
				title: { label: '布局方式', tip: 'true是垂直布局，false是水平布局' },
				setter: {
					componentName: 'BoolSetter',
					initialValue: true,
				},
			},
			{
				name: 'border',
				title: { label: '显示边框', tip: '是否显示分割线边框' },
				setter: {
					componentName: 'BoolSetter',
					initialValue: false,
				},
			},
			{
				name: 'height',
				title: { label: '容器高度', tip: '整体容器高度' },
				setter: {
					componentName: 'StringSetter',
				},
			},
			{
				name: 'width',
				title: { label: '容器宽度', tip: '整体容器宽度' },
				setter: {
					componentName: 'StringSetter',
				},
			},
			{
				name: 'pane1Width',
				title: { label: '面板1宽度', tip: '垂直布局时面板1的宽度' },
				setter: {
					componentName: 'StringSetter',
				},
			},
			{
				name: 'pane1MinWidth',
				title: { label: '面板1最小宽度', tip: '面板1的最小宽度限制' },
				setter: {
					componentName: 'StringSetter',
				},
			},
			{
				name: 'pane1MaxWidth',
				title: { label: '面板1最大宽度', tip: '面板1的最大宽度限制' },
				setter: {
					componentName: 'StringSetter',
				},
			},
			{
				name: 'pane1Height',
				title: { label: '面板1高度', tip: '水平布局时面板1的高度' },
				setter: {
					componentName: 'StringSetter',
				},
			},
			{
				name: 'pane1MinHeight',
				title: { label: '面板1最小高度', tip: '面板1的最小高度限制' },
				setter: {
					componentName: 'StringSetter',
				},
			},
			{
				name: 'pane1MaxHeight',
				title: { label: '面板1最大高度', tip: '面板1的最大高度限制' },
				setter: {
					componentName: 'StringSetter',
				},
			},
			{
				name: 'pane2Width',
				title: { label: '面板2宽度', tip: '垂直布局时面板2的宽度' },
				setter: {
					componentName: 'StringSetter',
				},
			},
			{
				name: 'pane2MinWidth',
				title: { label: '面板2最小宽度', tip: '面板2的最小宽度限制' },
				setter: {
					componentName: 'StringSetter',
				},
			},
			{
				name: 'pane2MaxWidth',
				title: { label: '面板2最大宽度', tip: '面板2的最大宽度限制' },
				setter: {
					componentName: 'StringSetter',
				},
			},
			{
				name: 'pane2Height',
				title: { label: '面板2高度', tip: '水平布局时面板2的高度' },
				setter: {
					componentName: 'StringSetter',
				},
			},
			{
				name: 'pane2MinHeight',
				title: { label: '面板2最小高度', tip: '面板2的最小高度限制' },
				setter: {
					componentName: 'StringSetter',
				},
			},
			{
				name: 'pane2MaxHeight',
				title: { label: '面板2最大高度', tip: '面板2的最大高度限制' },
				setter: {
					componentName: 'StringSetter',
				},
			},
		],
	},
	snippets: [
		{
			title: '分割器',
			schema: {
				componentName: 'Split',
				props: {
					pane1: {
						type: 'JSSlot',
						value: [
							{
								componentName: 'Layout',
								props: {
									style: {
										height: '100%',
									},
								},
							},
						],
					},
					pane2: {
						type: 'JSSlot',
						value: [
							{
								componentName: 'Layout',
								props: {
									style: {
										height: '100%',
									},
								},
							},
						],
					},
				},
			},
		},
	],
};
