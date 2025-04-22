/*
 * @Author: shuwen 1243889238@qq.com
 * @Date: 2025-04-08 14:35:21
 * @LastEditors: shuwen 1243889238@qq.com
 * @LastEditTime: 2025-04-22 20:44:45
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
						id: 'findOrderClassessByPage',
						description: '获取班次',
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
					{
						id: 'login',
						description: '登录',
						isInit: false,
						isSync: false,
						options: {
							uri: 'api/login',
							method: 'POST',
							params: {
								type: 'JSExpression',
								value: "['system', '123456']",
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
				"import { defineComponent } from 'vue';\n\nexport default defineComponent({\n  data: () => ({\n    data: []\n  }),\n  watch: {\n  },\n  mounted() {\n    console.log('did mount', this);\n  },\n  methods: {\n    onClick_m9jmiqf6(event, extParams) {\n      // 点击按钮时的回调\n      this.dataSourceMap.findOrderClassessByPage.load().then((resp)=>{\n        this.data = resp.result\n      })\n      console.log('onClick', this);\n    },\n    rowStyle_m9s2rm1y(params) {\n            const { row, column} = params\n      \n      if (column.field==='name'&&this.__appHelper.lodash.get(row,'name')==='中班') {\n        return {\n          color:\"red\"\n        }\n\n      }\n      return {}\n      \n    },\n    login(event,extParams){\n      this.dataSourceMap.login.load()\n   }\n  },\n})\n",
			hidden: false,
			title: '',
			isLocked: false,
			condition: true,
			conditionGroup: '',
			methods: {
				onClick_m9jmiqf6: {
					type: 'JSFunction',
					value:
						"function (event, extParams) {\n      // 点击按钮时的回调\n      this.dataSourceMap.findOrderClassessByPage.load().then((resp)=>{\n        this.data = resp.result\n      })\n      console.log('onClick', this);\n    }",
				},
				rowStyle_m9s2rm1y: {
					type: 'JSFunction',
					value:
						"function (params) {\n            const { row, column} = params\n      \n      if (column.field==='name'&&this.__appHelper.lodash.get(row,'name')==='中班') {\n        return {\n          color:\"red\"\n        }\n\n      }\n      return {}\n      \n    }",
				},
				login: {
					type: 'JSFunction',
					value:
						'function (event,extParams){\n      this.dataSourceMap.login.load()\n   }',
				},
			},
			meta: {
				originCode:
					"import { defineComponent } from 'vue';\n\nexport default defineComponent({\n  data: () => ({\n    data: []\n  }),\n  watch: {\n  },\n  mounted() {\n    console.log('did mount', this);\n  },\n  methods: {\n    onClick_m9jmiqf6(event, extParams) {\n      // 点击按钮时的回调\n      this.dataSourceMap.findOrderClassessByPage.load().then((resp)=>{\n        this.data = resp.result\n      })\n      console.log('onClick', this);\n    },\n    rowStyle_m9s2rm1y(params) {\n           const { row, column} = params\n      \n      if (column.field==='name'&&this.__appHelper.lodash.get(row,'name')==='中班') {\n        return {\n          color:\"red\"\n        }\n\n      }\n      return {}\n      \n    },\n    login(event,extParams){\n      this.dataSourceMap.login.load()\n   }\n  },\n})\n",
			},
			state: {
				data: [],
			},
			lifeCycles: {
				mounted: {
					type: 'JSFunction',
					value: "function () {\n    console.log('did mount', this);\n  }",
				},
			},
			children: [
				{
					componentName: 'Button',
					id: 'node_ocm9s3tefp1',
					props: {
						children: '登录',
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
									relatedEventName: 'login',
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
								'function(){return this.login.apply(this,Array.prototype.slice.call(arguments).concat([{}])) }',
						},
					},
					docId: 'docm9s3tefp',
					hidden: false,
					title: '',
					isLocked: false,
					condition: true,
					conditionGroup: '',
				},
				{
					componentName: 'Button',
					id: 'node_ocm9jmiqb61',
					props: {
						children: '刷新',
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
								title: 'id',
								width: 200,
								field: 'id',
								dataType: 'text',
								editType: 'text',
							},
							{
								title: '班次',
								width: 200,
								field: 'name',
							},
							{
								title: '编码',
								width: 200,
								dataType: 'enum',
								editType: 'select',
								enumOptions: [
									{
										text: '10',
										value: 10,
										color: 'blue',
									},
									{
										text: '1',
										value: 1,
										color: 'red',
									},
								],
								field: 'version',
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
						cellStyle: {
							type: 'JSFunction',
							value:
								'function(){ return this.rowStyle_m9s2rm1y.apply(this,Array.prototype.slice.call(arguments).concat([{}])) }',
						},
						editConfig: {
							enabled: true,
							trigger: 'click',
							mode: 'cell',
							showAsterisk: true,
							showIcon: true,
							showUpdateStatus: true,
							showInsertStatus: true,
							autoPos: true,
							autoFocus: true,
							autoClear: true,
						},
					},
					docId: 'docm9s2rlw0',
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
