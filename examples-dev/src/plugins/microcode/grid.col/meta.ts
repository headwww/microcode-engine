import snippets from './snippets';

export default {
	snippets,
	componentName: 'Col',
	title: '栅格-列',
	category: '布局',
	group: '基础组件',
	props: [
		{
			name: 'span',
			title: { label: '占位格数', tip: '栅格占位格数' },
			propType: 'number',
			setter: {
				componentName: 'NumberSetter',
				props: {
					min: 0,
					max: 24,
				},
			},
		},
		{
			name: 'order',
			title: { label: '栅格顺序', tip: '栅格顺序' },
			propType: 'number',
		},
		{
			name: 'pull',
			title: { label: '右侧偏移', tip: '栅格往右移动格数' },
			propType: 'number',
			setter: {
				componentName: 'NumberSetter',
				props: {
					min: 0,
					max: 24,
				},
			},
		},
		{
			name: 'push',
			title: { label: '左侧偏移', tip: '栅格往左移动格数' },
			propType: 'number',
			setter: {
				componentName: 'NumberSetter',
				props: {
					min: 0,
					max: 24,
				},
			},
		},
	],
	npm: {
		package: 'ArvinMicrocode',
		destructuring: true,
		exportName: 'Col',
		version: '1.0.0',
	},
	configure: {
		component: { isContainer: true, nestingRule: { parentWhitelist: ['Row'] } },
		supports: { style: true },
	},
};
