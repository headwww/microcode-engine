export default {
	componentName: 'Drawer',
	title: '抽屉',
	category: '反馈',
	group: '基础组件',
	npm: {
		package: 'ArvinMicrocode',
		// package: 'antd',
		destructuring: true,
		exportName: 'Drawer',
		version: '1.0.0',
	},
	configure: {
		component: {
			isModal: true,
			isContainer: true,
			rootSelector: '.ant-drawer-content-wrapper',
			nestingRule: {
				parentWhitelist: ['Page', 'Component'],
			},
		},
		props: [
			{
				title: {
					label: 'refId',
					tip: '用于获取组件实例，调用物料内部方法',
					icon: '',
				},
				name: 'ref',
				setter: {
					initialValue: () => {
						let guid = Date.now();
						function uniqueId(prefix = '') {
							return `${prefix}${(guid++).toString(36).toLowerCase()}`;
						}
						return uniqueId('lt_drawer_');
					},
					componentName: 'StringSetter',
					props: {
						disabled: true,
					},
				},
				extraProps: {
					display: 'block',
					supportVariable: false,
				},
			},
			{
				name: 'title',
				title: {
					label: '标题',
					tip: '对话框的标题',
				},
				setter: 'StringSetter',
			},
			{
				name: 'width',
				title: {
					label: '宽度',
					tip: '对话框的宽度',
				},
				setter: 'StringSetter',
			},
		],
	},
	snippets: [
		{
			title: '抽屉',
			schema: {
				componentName: 'Drawer',
			},
		},
	],
};
