import props from './props';

export default {
	componentName: 'Table',
	title: '表格',
	category: '表格',
	group: '基础组件',
	npm: {
		package: 'ArvinMicrocode',
		destructuring: true,
		exportName: 'Table',
		version: '1.0.0',
	},
	configure: {
		component: { isContainer: true },
		props,
	},
	snippets: [
		{
			title: '表格',
			schema: {
				componentName: 'Table',
			},
		},
	],
};
