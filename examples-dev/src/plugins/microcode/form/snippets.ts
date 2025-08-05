export default [
	{
		title: '表单容器',
		schema: {
			componentName: 'Form',
			props: {
				labelCol: {
					span: 6,
				},
				wrapperCol: {
					span: 14,
				},
				onValuesChange: {
					type: 'JSFunction',
					value:
						"function onValuesChange(changedValues, allValues) {\n  console.log('onValuesChange', changedValues, allValues);\n}",
				},
				onFinish: {
					type: 'JSFunction',
					value:
						"function onFinish(values) {\n  console.log('onFinish', values);\n}",
				},
				onFinishFailed: {
					type: 'JSFunction',
					value:
						"function onFinishFailed({ values, errorFields, outOfDate }) {\n  console.log('onFinishFailed', values, errorFields, outOfDate);\n}",
				},
				name: 'basic',
			},
			children: [
				{
					componentName: 'FormItem',
					props: {
						label: '表单项',
						labelAlign: 'right',
						colon: true,
						required: true,
						noStyle: false,
						valuePropName: 'value',
						name: 'a',
						requiredobj: {
							required: true,
							message: '必填',
						},
						typeobj: {
							type: null,
							message: null,
						},
						lenobj: {
							max: null,
							min: null,
							message: null,
						},
						patternobj: {
							pattern: null,
							message: null,
						},
					},
					children: [
						{
							componentName: 'Input',
							props: {
								placeholder: '请输入',
								bordered: true,
								disabled: false,
								size: 'middle',
							},
						},
					],
				},
				{
					componentName: 'FormItem',
					props: {
						wrapperCol: {
							offset: 6,
						},
					},
					children: [
						{
							componentName: 'Button',
							props: {
								type: 'primary',
								children: '提交',
								htmlType: 'submit',
							},
						},
						{
							componentName: 'Button',
							props: {
								style: {
									marginLeft: 20,
								},
								children: '取消',
							},
						},
					],
				},
			],
		},
	},
];
