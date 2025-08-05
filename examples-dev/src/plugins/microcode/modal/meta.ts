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
	configure: {
		component: {
			isModal: true,
			isContainer: true,
			rootSelector: '.ant-modal-content',
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
						return uniqueId('lt_modal_');
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
			{
				name: 'height',
				title: {
					label: '高度',
					tip: '对话框的高度',
				},
				setter: 'StringSetter',
			},
			{
				name: 'centered',
				title: {
					label: '是否居中',
					tip: '对话框是否居中',
				},
				setter: 'BoolSetter',
			},
			{
				name: 'onOk',
				title: {
					label: '确定回调',
					tip: '确定回调',
				},
				setter: 'FunctionSetter',
			},
			{
				name: 'onCancel',
				title: {
					label: '取消回调',
					tip: '取消回调',
				},
				setter: 'FunctionSetter',
			},
		],
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
