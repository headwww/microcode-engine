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
				props: {
					rowSelectorConfig: {
						visible: true,
						type: 'checkbox',
						width: 60,
						trigger: 'row',
						highlight: true,
						range: true,
						showHeader: true,
					},
					seqConfig: {
						visible: true,
						title: '序号',
						width: 60,
					},
					editConfig: {
						enabled: true,
						trigger: 'dblclick',
						mode: 'cell',
						showAsterisk: true,
						showIcon: true,
						showUpdateStatus: true,
						showInsertStatus: true,
						autoPos: true,
						autoFocus: true,
						autoClear: true,
					},
					columnConfig: {
						drag: true,
						resizable: true,
						isCurrent: false,
						isHover: false,
					},
					rowConfig: {
						isCurrent: true,
						isHover: true,
						resizable: false,
						drag: false,
					},
					stripe: true,
					showOverflow: true,
					virtualScroll: true,
					round: true,
					border: 'full',
					size: 'mini',
					align: 'left',
				},
			},
		},
	],
};
