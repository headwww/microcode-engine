export default {
	componentName: 'Modal',
	title: '对话框',
	category: '反馈',
	group: '基础组件',
	npm: {
		package: 'ArvinMicrocode',
		// package: 'antd',
		destructuring: true,
		exportName: 'Modal',
		version: '1.0.0',
	},
	props: [],
	configure: {
		component: {
			isModal: true,
			isContainer: true,
			rootSelector: '.ant-modal-content',
		},
		props: [],
	},
	snippets: [
		{
			title: '对话框',
			schema: {
				componentName: 'Modal',
			},
		},
	],
};
