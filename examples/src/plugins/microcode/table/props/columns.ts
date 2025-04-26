export default [
	{
		name: 'columns',
		title: '表格列',
		extraProps: {
			supportVariable: false,
		},
		setter: {
			componentName: 'ArraySetter',
			props: {
				itemSetter: {
					componentName: 'ObjectSetter',

					initialValue: (target: any) => {
						console.log(target);

						return {
							title: '标题',
							width: 200,
						};
					},
					props: {
						config: {
							items: [
								{
									name: 'property',
									title: {
										label: '列字段',
									},
									isRequired: true,
									setter: 'PropertySetter',
								},
								{
									name: 'title',
									title: '列标题',
									propType: 'string',
									isRequired: true,
									setter: 'StringSetter',
								},
								{
									name: 'dataType',
									title: {
										label: '数据类型',
										tip: '渲染非编辑状态时显示的样式',
									},
									setter: {
										componentName: 'SelectSetter',
										initialValue: 'text',
										props: {
											options: [
												{
													title: '文本',
													value: 'text',
												},
												{
													title: '链接',
													value: 'link',
												},
												{
													title: '数字',
													value: 'number',
												},
												{
													title: '布尔',
													value: 'boolean',
												},
												{
													title: '日期（年月日时分秒）',
													value: 'date',
												},
												{
													title: '时间（仅时分秒）',
													value: 'time',
												},
												{
													title: '枚举',
													value: 'enum',
												},
												{
													title: '实体',
													value: 'entity',
												},
												{
													title: '条码',
													value: 'code',
												},
											],
										},
									},
								},
								{
									name: 'editType',
									title: {
										label: '编辑类型',
										tip: '渲染编辑状态时使用的组件',
									},
									setter: {
										componentName: 'SelectSetter',
										initialValue: 'text',
										props: {
											options: [
												{
													title: '禁用编辑',
													value: 'disabledEdit',
												},
												{
													title: '文本',
													value: 'text',
												},
												{
													title: '数字',
													value: 'number',
												},
												{
													title: '布尔选择器',
													value: 'boolean',
												},
												{
													title: '下拉选择器',
													value: 'select',
												},
												{
													title: '日期选择器',
													value: 'date',
												},
												{
													title: '时间选择器',
													value: 'time',
												},
											],
										},
									},
								},
								{
									name: 'dateFormatter',
									title: '日期格式',
									condition: (target: any) =>
										target.getParent().getPropValue('dataType') === 'date',
									setter: {
										initialValue: 'YYYY-MM-DD HH:mm:ss',
										componentName: 'SelectSetter',
										props: {
											options: [
												{
													title: 'YYYY-MM-DD HH:mm:ss',
													value: 'YYYY-MM-DD HH:mm:ss',
												},
												{
													title: '年-月-日 时:分:秒',
													value: 'YYYY年MM月DD日 HH时mm分ss秒',
												},
												{
													title: 'YYYY-MM-DD HH:mm',
													value: 'YYYY-MM-DD HH:mm',
												},
												{
													title: '年-月-日 时:分',
													value: 'YYYY年MM月DD日 HH时mm分',
												},
												{
													title: 'YYYY-MM-DD HH',
													value: 'YYYY-MM-DD HH',
												},
												{
													title: '年-月-日 时',
													value: 'YYYY年MM月DD日 HH时',
												},
												{
													title: 'YYYY-MM-DD',
													value: 'YYYY-MM-DD',
												},
												{
													title: '年-月-日',
													value: 'YYYY年MM月DD日',
												},
												{
													title: 'YYYY-MM',
													value: 'YYYY-MM',
												},
												{
													title: '年-月',
													value: 'YYYY年MM月',
												},
												{
													title: 'YYYY',
													value: 'YYYY',
												},
												{
													title: '年',
													value: 'YYYY年',
												},
											],
										},
									},
								},
								{
									name: 'timeFormatter',
									title: '时间格式',
									condition: (target: any) =>
										target.getParent().getPropValue('dataType') === 'time',
									setter: {
										initialValue: 'HH:mm:ss',
										componentName: 'SelectSetter',
										props: {
											options: [
												{
													title: 'HH:mm:ss',
													value: 'HH:mm:ss',
												},
												{
													title: '时分秒',
													value: 'HH时mm分ss秒',
												},
												{
													title: 'HH:mm',
													value: 'HH:mm',
												},
												{
													title: '时分',
													value: 'HH时mm分',
												},
												{
													title: 'HH',
													value: 'HH',
												},
												{
													title: '时',
													value: 'HH时',
												},
											],
										},
									},
								},
								{
									name: 'digits',
									title: {
										label: '小数位',
										tip: '保留几位小数',
									},
									setter: 'NumberSetter',
									condition: (target: any) =>
										target.getParent().getPropValue('dataType') === 'number',
								},
								{
									name: 'boolOptions',
									title: '布尔数据',
									condition: (target: any) =>
										target.getParent().getPropValue('dataType') === 'boolean',
									setter: {
										componentName: 'JsonSetter',
										initialValue: () => [
											{
												label: '是',
												value: true,
												color: 'blue',
											},
											{
												label: '否',
												value: false,
												color: 'red',
											},
										],
									},
								},
								{
									name: 'enumOptions',
									title: '枚举数据',
									condition: (target: any) =>
										target.getParent().getPropValue('dataType') === 'enum',
									setter: {
										componentName: 'JsonSetter',
										initialValue: () => [
											{
												label: '测试1',
												value: 'TEXT1',
												color: 'blue',
											},
											{
												label: '测试2',
												value: 'TEXT2',
												color: 'red',
											},
											{
												label: '测试3',
												value: 'TEXT3',
												color: 'green',
											},
										],
									},
								},
								{
									name: 'codeType',
									title: {
										label: '条码类型',
										tip: '条形码需要文本是数字的',
									},
									condition: (target: any) =>
										target.getParent().getPropValue('dataType') === 'code',
									setter: {
										initialValue: 'qrCode',
										componentName: 'SegmentedSetter',
										props: {
											options: [
												{ label: '二维码', value: 'qrCode' },
												{ label: '条形码', value: 'barCode' },
											],
										},
									},
								},
								{
									name: 'tipContent',
									title: {
										label: '提示内容',
										tip: '当鼠标悬浮在列标题上时，显示的提示内容',
									},
									setter: 'StringSetter',
								},
								{
									name: 'width',
									title: '列宽',
									setter: {
										componentName: 'NumberSetter',
										props: {
											min: 0,
										},
									},
								},
								{
									name: 'dragSort',
									title: {
										label: '行拖拽',
										tip: '将该列设置为行拖拽的的触发列',
									},
									setter: {
										componentName: 'BoolSetter',
									},
								},
								{
									name: 'sortable',
									title: '排序',
									setter: 'BoolSetter',
								},
								{
									name: 'fixed',
									title: '固定列',
									setter: {
										componentName: 'SelectSetter',
										props: {
											options: [
												{
													title: '不固定',
													value: '',
												},
												{
													title: '左固定',
													value: 'left',
												},
												{
													title: '右固定',
													value: 'right',
												},
											],
										},
									},
								},
								{
									name: 'onLinkClick',
									title: {
										label: '链接点击事件',
										tip: '当为link类型时，点击链接的回调,当列是可编辑时无法触发',
									},
									setter: 'FunctionSetter',
									condition: (target: any) =>
										target.getParent().getPropValue('dataType') === 'link',
								},
							],
						},
					},
				},
			},
		},
	},
];
