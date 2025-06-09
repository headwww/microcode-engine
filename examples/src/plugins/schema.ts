/*
 * @Author: shuwen 1243889238@qq.com
 * @Date: 2025-04-08 14:35:21
 * @LastEditors: shuwen 1243889238@qq.com
 * @LastEditTime: 2025-05-20 16:36:18
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
	componentsTree: 
	[
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
					{
						id: 'saveSelectorList',
						description: '存储实体选择器',
						isInit: false,
						isSync: false,
						options: {
							uri: 'api/bsSetterService/saveSelectorList',
							method: 'POST',
							params: {
								type: 'JSExpression',
								value:
									'[\n [\n    {\n      targetClass: \'lt.fw.core.model.biz.Corp\',\n      tInfo: \'{"mode":"default","keywords":"公司选择器","dataConfig":{"url":"api/corpService/findCorps","targetClass":"lt.fw.core.model.biz.Corp","method":"POST"},"columns":[{"title":"名称","width":200,"filterable":true,"property":{"targetClass":"lt.fw.core.model.biz.Corp","fieldTitle":"名称","fieldTypeFlag":"0","topFieldType":"java.lang.String","fieldType":"java.lang.String","fieldName":"name","topFieldTypeFlag":"0"},"dataType":"text"},{"title":"编码","width":200,"filterable":true,"property":{"targetClass":"lt.fw.core.model.biz.Corp","fieldTitle":"编码","fieldTypeFlag":"0","topFieldType":"java.lang.String","fieldType":"java.lang.String","fieldName":"code","topFieldTypeFlag":"0"},"dataType":"text"}]}\',\n      keywords: \'公司选择器\'\n    }\n ]\n]',
							},
						},
						dataHandler: {
							type: 'JSFunction',
							value: 'function dataHandler(res) { \n\treturn res\n}\n',
						},
					},
					{
						id: 'findmainsByPage',
						description: '生产工单维护',
						isInit: false,
						isSync: false,
						options: {
							uri: 'api/productOrderService/findmainsByPage',
							method: 'POST',
						},
						dataHandler: {
							type: 'JSFunction',
							value: 'function dataHandler(res) { \n\treturn res\n}\n',
						},
						willFetch: {
							type: 'JSFunction',
							value:
								'function willFetch(options) {\n    return {\n        ...options,\n        params: [options.params[0], options.params[1]]\n    };\n}\n',
						},
					},
				],
			},
			css: 'body {\n }\n\n',
			originCode:
				"import { defineComponent } from 'vue';\n\nexport default defineComponent({\n  data: () => ({\n    data: [],\n    data1: {\n      result:[]\n    },\n    loading:false\n  }),\n  watch: {\n  },\n  mounted() {\n    console.log('did mount', this);\n  },\n  methods: {\n    onClick_m9jmiqf6(event, extParams) {\n      // 点击按钮时的回调\n      this.dataSourceMap.findOrderClassessByPage.load().then((resp)=>{\n        this.data = resp.result\n      })\n      console.log('onClick', this);\n    },\n    rowStyle_m9s2rm1y(params) {\n            const { row, column} = params\n      \n      if (column.field==='name'&&this.__appHelper.lodash.get(row,'name')==='中班') {\n        return {\n          color:\"red\"\n        }\n\n      }\n      return {}\n      \n    },\n    login(event,extParams){\n      this.dataSourceMap.login.load()\n   },\n    save123(event,extParams){\n      this.dataSourceMap.saveSelectorList.load()\n      console.log('onClick', event);\n    },\n    relationFunc_mac97olr(params) {\n      console.log(params)\n      return `this.name ='${params.row.corp.name}'`\n\n    },\n    onRefresh_mag45v52(params) {\n      this.loading = true\n      this.dataSourceMap.findmainsByPage\n      .load([params.pagerConfig, params.condition])\n      .then((resp) => {\n        this.data1 = resp\n      }).finally(()=>{\n        this.loading = false\n      })\n    }\n  },\n})\n",
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
				save123: {
					type: 'JSFunction',
					value:
						"function (event,extParams){\n      this.dataSourceMap.saveSelectorList.load()\n      console.log('onClick', event);\n    }",
				},
				relationFunc_mac97olr: {
					type: 'JSFunction',
					value:
						"function (params) {\n      console.log(params)\n      return `this.name ='${params.row.corp.name}'`\n\n    }",
				},
				onRefresh_mag45v52: {
					type: 'JSFunction',
					value:
						'function (params) {\n      this.loading = true\n      this.dataSourceMap.findmainsByPage\n      .load([params.pagerConfig, params.condition])\n      .then((resp) => {\n        this.data1 = resp\n      }).finally(()=>{\n        this.loading = false\n      })\n    }',
				},
			},
			meta: {
				originCode:
					"import { defineComponent } from 'vue';\n\nexport default defineComponent({\n  data: () => ({\n    data: [],\n    data1: {\n      result:[]\n    },\n    loading:false\n  }),\n  watch: {\n  },\n  mounted() {\n    console.log('did mount', this);\n  },\n  methods: {\n    onClick_m9jmiqf6(event, extParams) {\n      // 点击按钮时的回调\n      this.dataSourceMap.findOrderClassessByPage.load().then((resp)=>{\n        this.data = resp.result\n      })\n      console.log('onClick', this);\n    },\n    rowStyle_m9s2rm1y(params) {\n            const { row, column} = params\n      \n      if (column.field==='name'&&this.__appHelper.lodash.get(row,'name')==='中班') {\n        return {\n          color:\"red\"\n        }\n\n      }\n      return {}\n      \n    },\n    login(event,extParams){\n      this.dataSourceMap.login.load()\n   },\n    save123(event,extParams){\n      this.dataSourceMap.saveSelectorList.load()\n      console.log('onClick', event);\n    },\n    relationFunc_mac97olr(params) {\n      console.log(params)\n      return `this.name ='${params.row.corp.name}'`\n\n    },\n    onRefresh_mag45v52(params) {\n      this.loading = true\n      this.dataSourceMap.findmainsByPage\n      .load([params.pagerConfig, params.condition])\n      .then((resp) => {\n        this.data1 = resp\n      }).finally(()=>{\n        this.loading = false\n      })\n    }\n  },\n})\n",
			},
			state: {
				data: [],
				data1: {
					result: [],
				},
				loading: false,
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
					componentName: 'Button',
					id: 'node_ocma2loqn01',
					props: {
						children: '保存',
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
									relatedEventName: 'save123',
									paramStr: '{}',
								},
							],
							eventList: [
								{
									name: 'onClick',
									template:
										"onClick(event,${extParams}){\n// 点击按钮时的回调\nconsole.log('onClick', event);}",
								},
							],
						},
						onClick: {
							type: 'JSFunction',
							value:
								'function(){return this.save123.apply(this,Array.prototype.slice.call(arguments).concat([{}])) }',
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
					componentName: 'Layout',
					id: 'node_ocmaeysu2z1',
					props: {
						style: {
							height: '300px',
						},
					},
					docId: 'docmag45u2b',
					hidden: false,
					title: '',
					isLocked: false,
					condition: true,
					conditionGroup: '',
					children: [
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
										dataType: 'text',
										editType: 'text',
										dateFormatter: 'YYYY-MM-DD HH:mm:ss',
										timeFormatter: 'HH:mm:ss',
										boolOptions: [
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
										enumOptions: [
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
										codeType: 'qrCode',
										property: {
											targetClass: 'lt.app.productbasic.model.OrderClasses',
											fieldTypeFlag: '0',
											topFieldType: 'java.lang.String',
											fieldType: 'java.lang.String',
											fieldName: 'id',
											topFieldTypeFlag: '0',
										},
									},
									{
										title: '班次',
										width: 200,
										dataType: 'text',
										editType: 'text',
										dateFormatter: 'YYYY-MM-DD HH:mm:ss',
										timeFormatter: 'HH:mm:ss',
										boolOptions: [
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
										enumOptions: [
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
										codeType: 'qrCode',
										property: {
											targetClass: 'lt.app.productbasic.model.OrderClasses',
											fieldTypeFlag: '0',
											topFieldType: 'java.lang.String',
											fieldType: 'java.lang.String',
											fieldName: 'name',
											topFieldTypeFlag: '0',
										},
									},
									{
										title: '编码',
										width: 200,
										dataType: 'enum',
										editType: 'select',
										enumOptions: [
											{
												label: '10',
												value: 10,
												color: 'blue',
											},
											{
												label: '1',
												value: 1,
												color: 'red',
											},
										],
										dateFormatter: 'YYYY-MM-DD HH:mm:ss',
										timeFormatter: 'HH:mm:ss',
										boolOptions: [
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
										codeType: 'qrCode',
										property: {
											targetClass: 'lt.app.productbasic.model.OrderClasses',
											fieldTypeFlag: '0',
											topFieldType: 'java.lang.Long',
											fieldType: 'java.lang.Long',
											fieldName: 'version',
											topFieldTypeFlag: '0',
										},
									},
									{
										title: '标题',
										width: 200,
										dataType: 'date',
										editType: 'date',
										dateFormatter: 'YYYY-MM-DD HH:mm:ss',
										timeFormatter: 'HH:mm:ss',
										boolOptions: [
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
										enumOptions: [
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
										codeType: 'qrCode',
										property: {
											targetClass: 'lt.app.productbasic.model.OrderClasses',
											fieldTypeFlag: '0',
											topFieldType: 'java.util.Date',
											fieldType: 'java.util.Date',
											fieldName: 'updated',
											topFieldTypeFlag: '0',
										},
									},
									{
										title: '名称',
										width: 200,
										property: {
											targetClass: 'lt.app.productbasic.model.OrderClasses',
											fieldTitle: '名称',
											fieldTypeFlag: '0',
											topFieldType: 'lt.fw.core.model.biz.Corp',
											fieldType: 'java.lang.String',
											fieldName: 'corp.name',
											topFieldTypeFlag: '1',
										},
										editType: '1102238451895377920',
										dataConfig: {
											method: 'POST',
											url: 'api/corpService/findCorps',
											targetClass: 'lt.fw.core.model.biz.Corp',
										},
										columns: [
											{
												title: '名称',
												width: 200,
												filterable: true,
												property: {
													targetClass: 'lt.fw.core.model.biz.Corp',
													fieldTitle: '名称',
													fieldTypeFlag: '0',
													topFieldType: 'java.lang.String',
													fieldType: 'java.lang.String',
													fieldName: 'name',
													topFieldTypeFlag: '0',
												},
												dataType: 'text',
											},
										],
										editDataConfig: {
											url: 'api/corpService/findCorps',
											targetClass: 'lt.fw.core.model.biz.Corp',
											method: 'POST',
										},
										editColumns: [
											{
												title: '名称',
												width: 200,
												filterable: true,
												property: {
													targetClass: 'lt.fw.core.model.biz.Corp',
													fieldTitle: '名称',
													fieldTypeFlag: '0',
													topFieldType: 'java.lang.String',
													fieldType: 'java.lang.String',
													fieldName: 'name',
													topFieldTypeFlag: '0',
												},
												dataType: 'text',
											},
											{
												title: '编码',
												width: 200,
												filterable: true,
												property: {
													targetClass: 'lt.fw.core.model.biz.Corp',
													fieldTitle: '编码',
													fieldTypeFlag: '0',
													topFieldType: 'java.lang.String',
													fieldType: 'java.lang.String',
													fieldName: 'code',
													topFieldTypeFlag: '0',
												},
												dataType: 'text',
											},
										],
										filterDataConfig: {
											url: 'api/corpService/findCorps',
											targetClass: 'lt.fw.core.model.biz.Corp',
											method: 'POST',
										},
										filterColumns: [
											{
												title: '名称',
												width: 200,
												filterable: true,
												property: {
													targetClass: 'lt.fw.core.model.biz.Corp',
													fieldTitle: '名称',
													fieldTypeFlag: '0',
													topFieldType: 'java.lang.String',
													fieldType: 'java.lang.String',
													fieldName: 'name',
													topFieldTypeFlag: '0',
												},
												dataType: 'text',
											},
											{
												title: '编码',
												width: 200,
												filterable: true,
												property: {
													targetClass: 'lt.fw.core.model.biz.Corp',
													fieldTitle: '编码',
													fieldTypeFlag: '0',
													topFieldType: 'java.lang.String',
													fieldType: 'java.lang.String',
													fieldName: 'code',
													topFieldTypeFlag: '0',
												},
												dataType: 'text',
											},
										],
										dataType: 'text',
									},
									{
										title: '类型',
										width: 200,
										property: {
											targetClass: 'lt.app.productbasic.model.OrderClasses',
											fieldTitle: '类型',
											fieldTypeFlag: '2',
											enumInfo: [
												{
													value: '集团',
													key: 'HEAD',
													ordinal: 0,
												},
												{
													value: '公司',
													key: 'SUBSIDIARY',
													ordinal: 1,
												},
												{
													value: '工厂',
													key: 'FACTORY',
													ordinal: 2,
												},
											],
											topFieldType: 'lt.fw.core.model.biz.Corp',
											fieldType: 'lt.fw.core.model.biz.Corp$CorpType',
											fieldName: 'corp.type',
											topFieldTypeFlag: '1',
										},
										editDataConfig: {
											url: 'api/corpService/findCorps',
											targetClass: 'lt.fw.core.model.biz.Corp',
											method: 'POST',
											relationFunc: {
												type: 'JSFunction',
												value:
													'function(){ return this.relationFunc_mac97olr.apply(this,Array.prototype.slice.call(arguments).concat([{}])) }',
											},
										},
										editColumns: [
											{
												title: '名称',
												width: 200,
												filterable: true,
												property: {
													targetClass: 'lt.fw.core.model.biz.Corp',
													fieldTitle: '名称',
													fieldTypeFlag: '0',
													topFieldType: 'java.lang.String',
													fieldType: 'java.lang.String',
													fieldName: 'name',
													topFieldTypeFlag: '0',
												},
												dataType: 'text',
											},
											{
												title: '编码',
												width: 200,
												filterable: true,
												property: {
													targetClass: 'lt.fw.core.model.biz.Corp',
													fieldTitle: '编码',
													fieldTypeFlag: '0',
													topFieldType: 'java.lang.String',
													fieldType: 'java.lang.String',
													fieldName: 'code',
													topFieldTypeFlag: '0',
												},
												dataType: 'text',
											},
										],
										filterDataConfig: {
											url: 'api/corpService/findCorps',
											targetClass: 'lt.fw.core.model.biz.Corp',
											method: 'POST',
										},
										filterColumns: [
											{
												title: '名称',
												width: 200,
												filterable: true,
												property: {
													targetClass: 'lt.fw.core.model.biz.Corp',
													fieldTitle: '名称',
													fieldTypeFlag: '0',
													topFieldType: 'java.lang.String',
													fieldType: 'java.lang.String',
													fieldName: 'name',
													topFieldTypeFlag: '0',
												},
												dataType: 'text',
											},
											{
												title: '编码',
												width: 200,
												filterable: true,
												property: {
													targetClass: 'lt.fw.core.model.biz.Corp',
													fieldTitle: '编码',
													fieldTypeFlag: '0',
													topFieldType: 'java.lang.String',
													fieldType: 'java.lang.String',
													fieldName: 'code',
													topFieldTypeFlag: '0',
												},
												dataType: 'text',
											},
										],
										enumOptions: [
											{
												label: '集团',
												value: 'HEAD',
											},
											{
												label: '公司',
												value: 'SUBSIDIARY',
											},
											{
												label: '工厂',
												value: 'FACTORY',
											},
										],
										dataType: 'enum',
										editType: '1102238451895377920',
										dateFormatter: 'YYYY-MM-DD HH:mm:ss',
										timeFormatter: 'HH:mm:ss',
										codeType: 'qrCode',
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
								targetClass: 'lt.app.productbasic.model.OrderClasses',
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
				{
					componentName: 'Layout',
					id: 'node_ocmaeysu2z2',
					props: {
						style: {
							height: '250px',
						},
					},
					docId: 'docmag45u2b',
					hidden: false,
					title: '',
					isLocked: false,
					condition: true,
					conditionGroup: '',
					children: [
						{
							componentName: 'Table',
							id: 'node_ocmaeysu2z3',
							props: {
								targetClass: 'lt.app.product.model.ProductOrder',
								columns: [
									{
										title: 'ID',
										width: 200,
										property: {
											targetClass: 'lt.app.product.model.ProductOrder',
											fieldTitle: 'ID',
											fieldTypeFlag: '0',
											topFieldType: 'java.lang.String',
											fieldType: 'java.lang.String',
											fieldName: 'id',
											topFieldTypeFlag: '0',
										},
										dataType: 'text',
										editType: 'text',
									},
									{
										title: '单据日期',
										width: 200,
										property: {
											targetClass: 'lt.app.product.model.ProductOrder',
											fieldTitle: '单据日期',
											fieldTypeFlag: '0',
											topFieldType: 'java.util.Date',
											fieldType: 'java.util.Date',
											fieldName: 'date',
											topFieldTypeFlag: '0',
										},
										dateFormatter: 'YYYY-MM-DD HH:mm:ss',
										dataType: 'date',
										editType: 'date',
									},
									{
										title: '审核',
										width: 200,
										property: {
											targetClass: 'lt.app.product.model.ProductOrder',
											fieldTitle: '审核',
											fieldTypeFlag: '2',
											enumInfo: [
												{
													value: '未审核',
													key: 'UNAUDIT',
													ordinal: 0,
												},
												{
													value: '已审核',
													key: 'AUDITED',
													ordinal: 1,
												},
												{
													value: '未通过',
													key: 'NOT_PASS',
													ordinal: 2,
												},
											],
											topFieldType: 'lt.app.common.model.AuditStatus$Audit',
											fieldType: 'lt.app.common.model.AuditStatus$Audit',
											fieldName: 'status',
											topFieldTypeFlag: '2',
										},
										enumOptions: [
											{
												label: '未审核',
												value: 'UNAUDIT',
											},
											{
												label: '已审核',
												value: 'AUDITED',
											},
											{
												label: '未通过',
												value: 'NOT_PASS',
											},
										],
										dataType: 'enum',
										editType: 'select',
									},
									{
										title: '关闭',
										width: 200,
										property: {
											targetClass: 'lt.app.product.model.ProductOrder',
											fieldTitle: '关闭',
											fieldTypeFlag: '0',
											topFieldType: 'java.lang.Boolean',
											fieldType: 'java.lang.Boolean',
											fieldName: 'isClose',
											topFieldTypeFlag: '0',
										},
										boolOptions: [
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
										dataType: 'boolean',
										editType: 'boolean',
									},
									{
										title: '制单日期',
										width: 200,
										property: {
											targetClass: 'lt.app.product.model.ProductOrder',
											fieldTitle: '制单日期',
											fieldTypeFlag: '0',
											topFieldType: 'java.util.Date',
											fieldType: 'java.util.Date',
											fieldName: 'createDate',
											topFieldTypeFlag: '0',
										},
										dateFormatter: 'YYYY-MM-DD HH:mm:ss',
										dataType: 'date',
										editType: 'date',
									},
									{
										title: '版本',
										width: 200,
										property: {
											targetClass: 'lt.app.product.model.ProductOrder',
											fieldTitle: '',
											fieldTypeFlag: '0',
											topFieldType: 'java.lang.Long',
											fieldType: 'java.lang.Long',
											fieldName: 'version',
											topFieldTypeFlag: '0',
										},
										digits: 0,
										dataType: 'number',
										editType: 'number',
									},
									{
										title: '名称',
										width: 200,
										property: {
											targetClass: 'lt.app.product.model.ProductOrder',
											fieldTitle: '名称',
											fieldTypeFlag: '0',
											topFieldType: 'lt.fw.core.model.biz.Corp',
											fieldType: 'java.lang.String',
											fieldName: 'corp.name',
											topFieldTypeFlag: '1',
										},
										editDataConfig: {
											url: 'api/corpService/findCorps',
											targetClass: 'lt.fw.core.model.biz.Corp',
											method: 'POST',
										},
										editColumns: [
											{
												title: '名称',
												width: 200,
												filterable: true,
												property: {
													targetClass: 'lt.fw.core.model.biz.Corp',
													fieldTitle: '名称',
													fieldTypeFlag: '0',
													topFieldType: 'java.lang.String',
													fieldType: 'java.lang.String',
													fieldName: 'name',
													topFieldTypeFlag: '0',
												},
												dataType: 'text',
											},
											{
												title: '编码',
												width: 200,
												filterable: true,
												property: {
													targetClass: 'lt.fw.core.model.biz.Corp',
													fieldTitle: '编码',
													fieldTypeFlag: '0',
													topFieldType: 'java.lang.String',
													fieldType: 'java.lang.String',
													fieldName: 'code',
													topFieldTypeFlag: '0',
												},
												dataType: 'text',
											},
										],
										filterDataConfig: {
											url: 'api/corpService/findCorps',
											targetClass: 'lt.fw.core.model.biz.Corp',
											method: 'POST',
										},
										filterColumns: [
											{
												title: '名称',
												width: 200,
												filterable: true,
												property: {
													targetClass: 'lt.fw.core.model.biz.Corp',
													fieldTitle: '名称',
													fieldTypeFlag: '0',
													topFieldType: 'java.lang.String',
													fieldType: 'java.lang.String',
													fieldName: 'name',
													topFieldTypeFlag: '0',
												},
												dataType: 'text',
											},
											{
												title: '编码',
												width: 200,
												filterable: true,
												property: {
													targetClass: 'lt.fw.core.model.biz.Corp',
													fieldTitle: '编码',
													fieldTypeFlag: '0',
													topFieldType: 'java.lang.String',
													fieldType: 'java.lang.String',
													fieldName: 'code',
													topFieldTypeFlag: '0',
												},
												dataType: 'text',
											},
										],
										dataType: 'text',
										editType: '1102238451895377920',
									},
									{
										title: '编码',
										width: 200,
										property: {
											targetClass: 'lt.app.product.model.ProductOrder',
											fieldTitle: '编码',
											fieldTypeFlag: '0',
											topFieldType: 'lt.fw.core.model.biz.Corp',
											fieldType: 'java.lang.String',
											fieldName: 'corp.code',
											topFieldTypeFlag: '1',
										},
										editType: '1102238451895377920',
										editDataConfig: {
											url: 'api/corpService/findCorps',
											targetClass: 'lt.fw.core.model.biz.Corp',
											method: 'POST',
										},
										editColumns: [
											{
												title: '名称',
												width: 200,
												filterable: true,
												property: {
													targetClass: 'lt.fw.core.model.biz.Corp',
													fieldTitle: '名称',
													fieldTypeFlag: '0',
													topFieldType: 'java.lang.String',
													fieldType: 'java.lang.String',
													fieldName: 'name',
													topFieldTypeFlag: '0',
												},
												dataType: 'text',
											},
											{
												title: '编码',
												width: 200,
												filterable: true,
												property: {
													targetClass: 'lt.fw.core.model.biz.Corp',
													fieldTitle: '编码',
													fieldTypeFlag: '0',
													topFieldType: 'java.lang.String',
													fieldType: 'java.lang.String',
													fieldName: 'code',
													topFieldTypeFlag: '0',
												},
												dataType: 'text',
											},
										],
										filterDataConfig: {
											url: 'api/corpService/findCorps',
											targetClass: 'lt.fw.core.model.biz.Corp',
											method: 'POST',
										},
										filterColumns: [
											{
												title: '名称',
												width: 200,
												filterable: true,
												property: {
													targetClass: 'lt.fw.core.model.biz.Corp',
													fieldTitle: '名称',
													fieldTypeFlag: '0',
													topFieldType: 'java.lang.String',
													fieldType: 'java.lang.String',
													fieldName: 'name',
													topFieldTypeFlag: '0',
												},
												dataType: 'text',
											},
											{
												title: '编码',
												width: 200,
												filterable: true,
												property: {
													targetClass: 'lt.fw.core.model.biz.Corp',
													fieldTitle: '编码',
													fieldTypeFlag: '0',
													topFieldType: 'java.lang.String',
													fieldType: 'java.lang.String',
													fieldName: 'code',
													topFieldTypeFlag: '0',
												},
												dataType: 'text',
											},
										],
										dataType: 'text',
									},
								],
								pagerConfig: {
									enabled: true,
									pageSize: 50,
									pageSizes: [
										10,
										20,
										50,
										100,
										200,
										500,
										{
											label: '全量数据',
											value: -1,
										},
									],
									onPageChange: {
										type: 'JSFunction',
										value:
											'function(){ return this.onRefresh_mag45v52.apply(this,Array.prototype.slice.call(arguments).concat([{}])) }',
									},
								},
								onRefresh: {
									type: 'JSFunction',
									value:
										'function(){ return this.onRefresh_mag45v52.apply(this,Array.prototype.slice.call(arguments).concat([{}])) }',
								},
								ref: 'vxetable',
								data: {
									type: 'JSExpression',
									value: 'this.$data.data1',
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
								stripe: true,
								showOverflow: true,
								virtualScroll: true,
								round: true,
								border: 'full',
								size: 'mini',
								align: 'left',
								loading: {
									type: 'JSExpression',
									value: 'this.$data.loading',
								},
							},
							docId: 'docmag45u2b',
							hidden: false,
							title: '',
							isLocked: false,
							condition: true,
							conditionGroup: '',
						},
					],
				},
			],
		},
	],
};
