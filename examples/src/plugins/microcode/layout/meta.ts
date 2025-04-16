import snippets from './snippets';

export default {
	snippets,
	componentName: 'Layout',
	title: '容器',
	category: '布局',
	group: '基础组件',
	npm: {
		package: 'ArvinMicrocode',
		destructuring: true,
		exportName: 'Layout',
		version: '1.0.0',
	},
	configure: {
		component: { isContainer: true },
		supports: { style: true },
	},
};
