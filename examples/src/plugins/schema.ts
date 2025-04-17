/*
 * @Author: shuwen 1243889238@qq.com
 * @Date: 2025-04-08 14:35:21
 * @LastEditors: shuwen 1243889238@qq.com
 * @LastEditTime: 2025-04-17 17:28:29
 * @FilePath: /microcode-engine/examples/src/plugins/schema.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// const code = `import { defineComponent } from 'vue';

// export default defineComponent({
//   data: () => ({
//   }),
//   watch: {
//   },
//   methods: {
//   },
// })
// `;

// export default {
// 	componentsTree: [
// 		{
// 			componentName: 'Page',
// 			fileName: '/',
// 			id: 'node_docmtciv3eo1',
// 			props: {
// 				style: {},
// 			},
// 			state: {},
// 			dataSource: {
// 				list: [],
// 			},
// 			css: 'body {\n }\n\n',
// 			lifeCycles: {},
// 			methods: {},
// 			originCode: code,
// 			children: [],
// 		},
// 	],
// };

export default {
	componentsTree: [
		{
			componentName: 'Page',
			id: 'node_docmtciv3eo1',
			props: {},
			docId: 'docm9jmiqb6111',
			fileName: '/',
			dataSource: {
				list: [
					{
						id: 'dp_m9jm9v1a',
						description: 'api/orderClassesService/findOrderClassessByPage',
						isInit: false,
						isSync: false,
						options: {
							uri: 'api/orderClassesService/findOrderClassessByPage',
							method: 'POST',
							params: {
								type: 'JSExpression',
								value:
									'[\n  {\n    "pageNo": 0,\n    "pageSize": 100,\n    "rowCountEnabled": true\n  },\n  {\n    "targetClass": "lt.app.productbasic.model.OrderClasses",\n    "queryPath": [\n      "name",\n      "corp.name",\n      "starTime",\n      "endTime",\n      "id"\n    ]\n  }\n]',
							},
						},
						dataHandler: {
							type: 'JSFunction',
							value: 'function dataHandler(res) { \n\treturn res\n}\n',
						},
					},
				],
			},
			css: 'body {\n }\n\n',
			originCode:
				"import { defineComponent } from 'vue';\n\nexport default defineComponent({\n  data: () => ({\n    data: []\n  }),\n  watch: {\n  },\n  mounted() {\n    this.data = this.dataSourceMap.dp_m9jm9v1a.data.result\n    console.log('did mount', this);\n  },\n  methods: {\n    onClick_m9jmiqf6(event, extParams) {\n      // 点击按钮时的回调\n      console.log('onClick', this);\n    }\n  },\n})\n",
			hidden: false,
			title: '',
			isLocked: false,
			condition: true,
			conditionGroup: '',
			methods: {
				onClick_m9jmiqf6: {
					type: 'JSFunction',
					value:
						"function (event, extParams) {\n      // 点击按钮时的回调\n      console.log('onClick', this);\n    }",
				},
			},
			meta: {
				originCode:
					"import { defineComponent } from 'vue';\n\nexport default defineComponent({\n  data: () => ({\n    data: []\n  }),\n  watch: {\n  },\n  mounted() {\n    this.data = this.dataSourceMap.dp_m9jm9v1a.data.result\n    console.log('did mount', this);\n  },\n  methods: {\n    onClick_m9jmiqf6(event, extParams) {\n      // 点击按钮时的回调\n      console.log('onClick', this);\n    }\n  },\n})\n",
			},
			state: {
				data: [],
			},
			lifeCycles: {
				mounted: {
					type: 'JSFunction',
					value:
						"function () {\n    this.data = this.dataSourceMap.dp_m9jm9v1a.data.result\n    console.log('did mount', this);\n  }",
				},
			},
			children: [
				{
					componentName: 'Button',
					id: 'node_ocm9jmiqb61',
					props: {
						children: '按钮',
						htmlType: 'button',
						size: 'middle',
						shape: 'default',
						block: false,
						danger: false,
						ghost: false,
						disabled: false,
						__events: {
							eventDataList: [
								{
									type: 'componentEvent',
									name: 'onClick',
									relatedEventName: 'onClick_m9jmiqf6',
									paramStr: '{}',
								},
							],
							eventList: [
								{
									name: 'onClick',
									template:
										"onClick(event,${extParams}){\n// 点击按钮时的回调\nconsole.log('onClick', event);}",
									disabled: true,
								},
							],
						},
						onClick: {
							type: 'JSFunction',
							value:
								'function(){return this.onClick_m9jmiqf6.apply(this,Array.prototype.slice.call(arguments).concat([{}])) }',
						},
					},
					docId: 'docm9l2mtr5',
					hidden: false,
					title: '',
					isLocked: false,
					condition: true,
					conditionGroup: '',
				},
				{
					componentName: 'Table',
					id: 'node_ocm9l2mtr51',
					props: {
						data: {
							type: 'JSExpression',
							value: 'this.$data.data',
						},
						columns: [
							{
								title: '标题',
								width: 200,
								field: 'id',
							},
						],
						stripe: true,
						showOverflow: true,
						virtualScroll: true,
						drag: true,
						round: true,
						border: 'full',
						size: 'mini',
						align: 'left',
					},
					hidden: false,
					title: '',
					isLocked: false,
					condition: true,
					conditionGroup: '',
				},
			],
		},
	],
};
