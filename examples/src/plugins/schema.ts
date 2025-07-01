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
						id: 'findMrpCalculatsByPage',
						description: '运算查询',
						isInit: false,
						isSync: false,
						options: {
							uri: 'api/mrpCalculatService/findMrpCalculatsByPage',
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
					{
						id: 'findLinesByMainByPage',
						description: '工厂信息',
						isInit: false,
						isSync: false,
						options: {
							uri: 'api/mrpCalculatService/findLinesByMainByPage',
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
					{
						id: 'findMrpCalculatOccupysByPage',
						description: '占用信息',
						isInit: false,
						isSync: false,
						options: {
							uri: 'api/mrpCalculatService/findMrpCalculatOccupysByPage',
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
					{
						id: 'findMrpCalculatResults',
						description: '结果分析',
						isInit: false,
						isSync: false,
						options: {
							uri: 'api/mrpCalculatService/findMrpCalculatResults',
							method: 'POST',
						},
						dataHandler: {
							type: 'JSFunction',
							value: 'function dataHandler(res) { \n\treturn res\n}\n',
						},
						willFetch: {
							type: 'JSFunction',
							value:
								'function willFetch(options) {\n    return {\n        ...options,\n        params: [options.params[0]]\n    };\n}\n',
						},
					},
					{
						id: 'deleteMrpCalculats',
						description: '删除运算查询记录',
						isInit: false,
						isSync: false,
						options: {
							uri: 'api/mrpCalculatService/deleteMrpCalculats',
							method: 'POST',
						},
						dataHandler: {
							type: 'JSFunction',
							value: 'function dataHandler(res) { \n\treturn res\n}\n',
						},
						willFetch: {
							type: 'JSFunction',
							value:
								'function willFetch(options) {\n    return {\n        ...options,\n        params: [options.params[0]],\n        serialize:true\n    };\n}\n',
						},
					},
				],
			},
			css: 'body {\n }\n\n',
			originCode:
				"import { defineComponent } from 'vue';\n\nexport default defineComponent({\n  data: () => ({\n    // 运算查询结果\n    mainData: [],\n    mainLoading: false,\n    // 选中的table\n    activeKey: '工厂',\n    // 选中的id\n    checkRowId: null,\n    lineLoading: false,\n    GCData: [],\n    WTGCData: [],\n    ZYXXData: [],\n    JGFXData: []\n  }),\n  mounted() {\n    console.log(this)\n    this.$nextTick(() => {\n      this.findMain(this.$refs?.lt_modal_mcba3usn?.getParams())\n    })\n  },\n  methods: {\n    // 查询主表信息\n    findMain(params) {\n      this.checkRowId = null\n      this.mainLoading = true\n      this.dataSourceMap.findMrpCalculatsByPage\n        .load([params?.pagerConfig, params?.condition])\n        .then((resp) => {\n          this.mainData = resp\n        }).finally(() => {\n          this.mainLoading = false\n        })\n    },\n    // 选中主表一条数据\n    onLinkClick(params) {\n      console.log(params?.row?.id);\n      this.checkRowId = params?.row?.id;\n      this.findLines();\n    },\n    // 当选中主表某一行或者切换tab的时候查询子表信息\n    findLines() {\n      if (this.checkRowId == null) {\n        return\n      }\n      // 工厂\n      this.lineLoading = true\n      if (this.activeKey === '工厂') {\n        const params = this.$refs.lt_modal_mcba4vdr?.getParams();\n        this.dataSourceMap.findLinesByMainByPage.load([params?.pagerConfig, {\n          ...params?.condition,\n          propertyParams: {\n            'parent.id': this.checkRowId\n          }\n        }]).then((resp) => {\n          this.GCData = resp\n        }).finally(() => {\n          this.lineLoading = false\n        })\n      }\n      // 委托工厂\n      if (this.activeKey === '委托工厂') {\n        const params = this.$refs.lt_modal_mcba5vos?.getParams();\n        this.dataSourceMap.findLinesByMainByPage.load([params?.pagerConfig, {\n          ...params?.condition,\n          expression: \"this.company.id<>'1089495675156045824'\",\n          propertyParams: {\n            'parent.id': this.checkRowId\n          }\n        }]).then((resp) => {\n          this.WTGCData = resp\n        }).finally(() => {\n          this.lineLoading = false\n        })\n      }\n      // 占用信息\n      if (this.activeKey === '占用信息') {\n        const params = this.$refs.lt_modal_mcba5ys5?.getParams();\n        this.dataSourceMap.findMrpCalculatOccupysByPage.load([params?.pagerConfig, {\n          ...params?.condition,\n          propertyParams: {\n            'parent.id': this.checkRowId\n          }\n        }]).then((resp) => {\n          this.ZYXXData = resp\n        }).finally(() => {\n          this.lineLoading = false\n        })\n      }\n      // 结果分析\n      if (this.activeKey === '结果分析') {\n        const params = this.$refs.lt_modal_mcba60qn?.getParams();\n        console.log(params, this)\n        this.dataSourceMap.findMrpCalculatResults.load([{\n          ...params?.condition,\n          propertyParams: {\n            'parent.id': this.checkRowId\n          }\n        }]).then((resp) => {\n          this.JGFXData = resp\n        }).finally(() => {\n          this.lineLoading = false\n        })\n      }\n    },\n    // 主表删除记录\n    onDeleteMrpCalculats(extParams) {\n      const records = extParams?.$table.getCheckboxRecords()\n      if (records.length === 0) {\n        this.$feedback.message.warn(\"请选择需要删除的行\")\n        return\n      }\n      this.mainLoading = true\n      this.dataSourceMap.deleteMrpCalculats\n        .load([extParams?.$table.getCheckboxRecords()])\n        .then(() => {\n          this.$feedback.message.success(\"删除成功\")\n          this.findMain(this.$refs?.lt_modal_mcba3usn?.getParams())\n        }).catch(() => {\n          this.mainLoading = false\n          this.$feedback.message.error(\"删除失败\")\n        })\n    },\n    // 保存\n    onSave(extParams) {\n      const tableRef = this.$refs.lt_modal_mcba3usn?.$table()\n      const concatArr = this.$lodash.concat(tableRef?.insertRecords, tableRef?.updateRecords)\n      console.log(concatArr)\n\n    },\n    // 工厂净需求表尾计算\n    footerDataMethod(params) {\n      const total = this.$lodash.sumBy(params, item => item.netDemandQuantity || 0);\n      return total\n    },\n    onLinkMinxiClick() {\n      this.$refs.lt_drawer_mcd315y3?.open()\n    }\n  },\n})\n\n\n\n\n\n",
			hidden: false,
			title: '',
			isLocked: false,
			condition: true,
			conditionGroup: '',
			methods: {
				findMain: {
					type: 'JSFunction',
					value:
						'function (params) {\n      this.checkRowId = null\n      this.mainLoading = true\n      this.dataSourceMap.findMrpCalculatsByPage\n        .load([params?.pagerConfig, params?.condition])\n        .then((resp) => {\n          this.mainData = resp\n        }).finally(() => {\n          this.mainLoading = false\n        })\n    }',
				},
				onLinkClick: {
					type: 'JSFunction',
					value:
						'function (params) {\n      console.log(params?.row?.id);\n      this.checkRowId = params?.row?.id;\n      this.findLines();\n    }',
				},
				findLines: {
					type: 'JSFunction',
					value:
						"function () {\n      if (this.checkRowId == null) {\n        return\n      }\n      // 工厂\n      this.lineLoading = true\n      if (this.activeKey === '工厂') {\n        const params = this.$refs.lt_modal_mcba4vdr?.getParams();\n        this.dataSourceMap.findLinesByMainByPage.load([params?.pagerConfig, {\n          ...params?.condition,\n          propertyParams: {\n            'parent.id': this.checkRowId\n          }\n        }]).then((resp) => {\n          this.GCData = resp\n        }).finally(() => {\n          this.lineLoading = false\n        })\n      }\n      // 委托工厂\n      if (this.activeKey === '委托工厂') {\n        const params = this.$refs.lt_modal_mcba5vos?.getParams();\n        this.dataSourceMap.findLinesByMainByPage.load([params?.pagerConfig, {\n          ...params?.condition,\n          expression: \"this.company.id<>'1089495675156045824'\",\n          propertyParams: {\n            'parent.id': this.checkRowId\n          }\n        }]).then((resp) => {\n          this.WTGCData = resp\n        }).finally(() => {\n          this.lineLoading = false\n        })\n      }\n      // 占用信息\n      if (this.activeKey === '占用信息') {\n        const params = this.$refs.lt_modal_mcba5ys5?.getParams();\n        this.dataSourceMap.findMrpCalculatOccupysByPage.load([params?.pagerConfig, {\n          ...params?.condition,\n          propertyParams: {\n            'parent.id': this.checkRowId\n          }\n        }]).then((resp) => {\n          this.ZYXXData = resp\n        }).finally(() => {\n          this.lineLoading = false\n        })\n      }\n      // 结果分析\n      if (this.activeKey === '结果分析') {\n        const params = this.$refs.lt_modal_mcba60qn?.getParams();\n        console.log(params, this)\n        this.dataSourceMap.findMrpCalculatResults.load([{\n          ...params?.condition,\n          propertyParams: {\n            'parent.id': this.checkRowId\n          }\n        }]).then((resp) => {\n          this.JGFXData = resp\n        }).finally(() => {\n          this.lineLoading = false\n        })\n      }\n    }",
				},
				onDeleteMrpCalculats: {
					type: 'JSFunction',
					value:
						'function (extParams) {\n      const records = extParams?.$table.getCheckboxRecords()\n      if (records.length === 0) {\n        this.$feedback.message.warn("请选择需要删除的行")\n        return\n      }\n      this.mainLoading = true\n      this.dataSourceMap.deleteMrpCalculats\n        .load([extParams?.$table.getCheckboxRecords()])\n        .then(() => {\n          this.$feedback.message.success("删除成功")\n          this.findMain(this.$refs?.lt_modal_mcba3usn?.getParams())\n        }).catch(() => {\n          this.mainLoading = false\n          this.$feedback.message.error("删除失败")\n        })\n    }',
				},
				onSave: {
					type: 'JSFunction',
					value:
						'function (extParams) {\n      const tableRef = this.$refs.lt_modal_mcba3usn?.$table()\n      const concatArr = this.$lodash.concat(tableRef?.insertRecords, tableRef?.updateRecords)\n      console.log(concatArr)\n\n    }',
				},
				footerDataMethod: {
					type: 'JSFunction',
					value:
						'function (params) {\n      const total = this.$lodash.sumBy(params, item => item.netDemandQuantity || 0);\n      return total\n    }',
				},
				onLinkMinxiClick: {
					type: 'JSFunction',
					value:
						'function () {\n      this.$refs.lt_drawer_mcd315y3?.open()\n    }',
				},
			},
			meta: {
				originCode:
					"import { defineComponent } from 'vue';\n\nexport default defineComponent({\n  data: () => ({\n    // 运算查询结果\n    mainData: [],\n    mainLoading: false,\n    // 选中的table\n    activeKey: '工厂',\n    // 选中的id\n    checkRowId: null,\n    lineLoading: false,\n    GCData: [],\n    WTGCData: [],\n    ZYXXData: [],\n    JGFXData: []\n  }),\n  mounted() {\n    console.log(this)\n    this.$nextTick(() => {\n      this.findMain(this.$refs?.lt_modal_mcba3usn?.getParams())\n    })\n  },\n  methods: {\n    // 查询主表信息\n    findMain(params) {\n      this.checkRowId = null\n      this.mainLoading = true\n      this.dataSourceMap.findMrpCalculatsByPage\n        .load([params?.pagerConfig, params?.condition])\n        .then((resp) => {\n          this.mainData = resp\n        }).finally(() => {\n          this.mainLoading = false\n        })\n    },\n    // 选中主表一条数据\n    onLinkClick(params) {\n      console.log(params?.row?.id);\n      this.checkRowId = params?.row?.id;\n      this.findLines();\n    },\n    // 当选中主表某一行或者切换tab的时候查询子表信息\n    findLines() {\n      if (this.checkRowId == null) {\n        return\n      }\n      // 工厂\n      this.lineLoading = true\n      if (this.activeKey === '工厂') {\n        const params = this.$refs.lt_modal_mcba4vdr?.getParams();\n        this.dataSourceMap.findLinesByMainByPage.load([params?.pagerConfig, {\n          ...params?.condition,\n          propertyParams: {\n            'parent.id': this.checkRowId\n          }\n        }]).then((resp) => {\n          this.GCData = resp\n        }).finally(() => {\n          this.lineLoading = false\n        })\n      }\n      // 委托工厂\n      if (this.activeKey === '委托工厂') {\n        const params = this.$refs.lt_modal_mcba5vos?.getParams();\n        this.dataSourceMap.findLinesByMainByPage.load([params?.pagerConfig, {\n          ...params?.condition,\n          expression: \"this.company.id<>'1089495675156045824'\",\n          propertyParams: {\n            'parent.id': this.checkRowId\n          }\n        }]).then((resp) => {\n          this.WTGCData = resp\n        }).finally(() => {\n          this.lineLoading = false\n        })\n      }\n      // 占用信息\n      if (this.activeKey === '占用信息') {\n        const params = this.$refs.lt_modal_mcba5ys5?.getParams();\n        this.dataSourceMap.findMrpCalculatOccupysByPage.load([params?.pagerConfig, {\n          ...params?.condition,\n          propertyParams: {\n            'parent.id': this.checkRowId\n          }\n        }]).then((resp) => {\n          this.ZYXXData = resp\n        }).finally(() => {\n          this.lineLoading = false\n        })\n      }\n      // 结果分析\n      if (this.activeKey === '结果分析') {\n        const params = this.$refs.lt_modal_mcba60qn?.getParams();\n        console.log(params, this)\n        this.dataSourceMap.findMrpCalculatResults.load([{\n          ...params?.condition,\n          propertyParams: {\n            'parent.id': this.checkRowId\n          }\n        }]).then((resp) => {\n          this.JGFXData = resp\n        }).finally(() => {\n          this.lineLoading = false\n        })\n      }\n    },\n    // 主表删除记录\n    onDeleteMrpCalculats(extParams) {\n      const records = extParams?.$table.getCheckboxRecords()\n      if (records.length === 0) {\n        this.$feedback.message.warn(\"请选择需要删除的行\")\n        return\n      }\n      this.mainLoading = true\n      this.dataSourceMap.deleteMrpCalculats\n        .load([extParams?.$table.getCheckboxRecords()])\n        .then(() => {\n          this.$feedback.message.success(\"删除成功\")\n          this.findMain(this.$refs?.lt_modal_mcba3usn?.getParams())\n        }).catch(() => {\n          this.mainLoading = false\n          this.$feedback.message.error(\"删除失败\")\n        })\n    },\n    // 保存\n    onSave(extParams) {\n      const tableRef = this.$refs.lt_modal_mcba3usn?.$table()\n      const concatArr = this.$lodash.concat(tableRef?.insertRecords, tableRef?.updateRecords)\n      console.log(concatArr)\n\n    },\n    // 工厂净需求表尾计算\n    footerDataMethod(params) {\n      const total = this.$lodash.sumBy(params, item => item.netDemandQuantity || 0);\n      return total\n    },\n    onLinkMinxiClick() {\n      this.$refs.lt_drawer_mcd315y3?.open()\n    }\n  },\n})\n\n\n\n\n\n",
			},
			state: {
				mainData: [],
				mainLoading: false,
				activeKey: '工厂',
				lineLoading: false,
				GCData: [],
				WTGCData: [],
				ZYXXData: [],
				JGFXData: [],
			},
			lifeCycles: {
				mounted: {
					type: 'JSFunction',
					value:
						'function () {\n    console.log(this)\n    this.$nextTick(() => {\n      this.findMain(this.$refs?.lt_modal_mcba3usn?.getParams())\n    })\n  }',
				},
			},
			children: [
				{
					componentName: 'LtPage',
					id: 'node_ocmcb9vpw81',
					props: {},
					docId: 'docmcba46o0',
					hidden: false,
					title: '',
					isLocked: false,
					condition: true,
					conditionGroup: '',
					children: [
						{
							componentName: 'Split',
							id: 'node_ocmcb9vpw82',
							props: {
								items: [
									{
										key: 'pane-item-1',
										children: {
											type: 'JSSlot',
											value: [
												{
													componentName: 'Table',
													id: 'node_ocmcba3nkw1',
													props: {
														rowSelectorConfig: {
															visible: true,
															type: 'checkbox',
															width: 60,
															trigger: 'cell',
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
														tableId: 'lt_table_mcba3usn',
														ref: 'lt_modal_mcba3usn',
														targetClass: 'lt.app.require.model.MrpCalculat',
														columns: [
															{
																title: '名称',
																width: 200,
																property: {
																	targetClass:
																		'lt.app.require.model.MrpCalculat',
																	fieldTitle: '名称',
																	fieldTypeFlag: '0',
																	topFieldType: 'java.lang.String',
																	fieldType: 'java.lang.String',
																	fieldName: 'name',
																	topFieldTypeFlag: '0',
																},
																_DATA_TYPE: 'children',
																editType: 'disabledEdit',
																dataType: 'link',
																onLinkClick: {
																	type: 'JSFunction',
																	value:
																		'function(){ return this.onLinkClick.apply(this,Array.prototype.slice.call(arguments).concat([{}])) }',
																},
																dateFormatter: 'YYYY-MM-DD HH:mm:ss',
																timeFormatter: 'HH:mm:ss',
																codeType: 'qrCode',
															},
															{
																title: '公司',
																width: 200,
																property: {
																	targetClass:
																		'lt.app.require.model.MrpCalculat',
																	fieldTitle: '名称',
																	fieldTypeFlag: '0',
																	topFieldType: 'lt.fw.core.model.biz.Corp',
																	fieldType: 'java.lang.String',
																	fieldName: 'corp.name',
																	topFieldTypeFlag: '1',
																},
																_DATA_TYPE: 'children',
																editType: 'customEntity',
																editDataConfig: {
																	method: 'POST',
																	url: 'api/corpService/findCorps',
																	targetClass: 'lt.fw.core.model.biz.Corp',
																},
																filterDataConfig: {
																	method: 'POST',
																	url: 'api/corpService/findCorps',
																	targetClass: 'lt.fw.core.model.biz.Corp',
																},
																dataType: 'text',
																dateFormatter: 'YYYY-MM-DD HH:mm:ss',
																timeFormatter: 'HH:mm:ss',
																codeType: 'qrCode',
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
															},
															{
																title: '工厂',
																width: 200,
																property: {
																	targetClass:
																		'lt.app.require.model.MrpCalculat',
																	fieldTitle: '名称',
																	fieldTypeFlag: '0',
																	topFieldType: 'lt.fw.core.model.biz.Corp',
																	fieldType: 'java.lang.String',
																	fieldName: 'company.name',
																	topFieldTypeFlag: '1',
																},
																_DATA_TYPE: 'children',
																editType: 'customEntity',
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
																],
																dataType: 'text',
															},
															{
																title: '备注',
																width: 100,
																property: {
																	targetClass:
																		'lt.app.require.model.MrpCalculat',
																	fieldTitle: '备注',
																	fieldTypeFlag: '0',
																	topFieldType: 'java.lang.String',
																	fieldType: 'java.lang.String',
																	fieldName: 'remarks',
																	topFieldTypeFlag: '0',
																},
																_DATA_TYPE: 'children',
																dataType: 'text',
																editType: 'text',
																dateFormatter: 'YYYY-MM-DD HH:mm:ss',
																timeFormatter: 'HH:mm:ss',
																codeType: 'qrCode',
																validConfig: [],
															},
															{
																title: '工作中心名称',
																width: 100,
																property: {
																	targetClass:
																		'lt.app.require.model.MrpCalculat',
																	fieldTitle: '工作中心名称',
																	fieldTypeFlag: '0',
																	topFieldType:
																		'lt.app.common.model.WorkCenter',
																	fieldType: 'java.lang.String',
																	fieldName: 'workCenter.name',
																	topFieldTypeFlag: '1',
																},
																_DATA_TYPE: 'children',
																dataType: 'text',
																editType: 'disabledEdit',
																dateFormatter: 'YYYY-MM-DD HH:mm:ss',
																timeFormatter: 'HH:mm:ss',
																codeType: 'qrCode',
															},
															{
																title: '提交状态',
																width: 100,
																property: {
																	targetClass:
																		'lt.app.require.model.MrpCalculat',
																	fieldTitle: '提交状态',
																	fieldTypeFlag: '0',
																	topFieldType: 'java.lang.Boolean',
																	fieldType: 'java.lang.Boolean',
																	fieldName: 'isSubmit',
																	topFieldTypeFlag: '0',
																},
																_DATA_TYPE: 'children',
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
																dateFormatter: 'YYYY-MM-DD HH:mm:ss',
																timeFormatter: 'HH:mm:ss',
																codeType: 'qrCode',
															},
															{
																title: '区分是ap/as',
																width: 120,
																property: {
																	targetClass:
																		'lt.app.require.model.MrpCalculat',
																	fieldTitle: '区分是ap/as',
																	fieldTypeFlag: '2',
																	enumInfo: [
																		{
																			value: 'AP',
																			key: 'AP',
																			ordinal: 0,
																		},
																		{
																			value: 'AS',
																			key: 'AS',
																			ordinal: 1,
																		},
																	],
																	topFieldType:
																		'lt.app.require.model.MrpCalculat$Flag',
																	fieldType:
																		'lt.app.require.model.MrpCalculat$Flag',
																	fieldName: 'flag',
																	topFieldTypeFlag: '2',
																},
																_DATA_TYPE: 'children',
																enumOptions: [
																	{
																		label: 'AP',
																		value: 'AP',
																		color: 'blue',
																	},
																	{
																		label: 'AS',
																		value: 'AS',
																		color: 'green',
																	},
																],
																dataType: 'enum',
																editType: 'select',
																dateFormatter: 'YYYY-MM-DD HH:mm:ss',
																timeFormatter: 'HH:mm:ss',
																codeType: 'qrCode',
															},
															{
																title: '运算参数',
																width: 100,
																property: {
																	targetClass:
																		'lt.app.require.model.MrpCalculat',
																	fieldTitle: '名称',
																	fieldTypeFlag: '0',
																	topFieldType:
																		'lt.app.require.model.MrpParameter',
																	fieldType: 'java.lang.String',
																	fieldName: 'parameter.name',
																	topFieldTypeFlag: '1',
																},
																_DATA_TYPE: 'children',
																dataType: 'text',
																editType: 'disabledEdit',
																dateFormatter: 'YYYY-MM-DD HH:mm:ss',
																timeFormatter: 'HH:mm:ss',
																codeType: 'qrCode',
															},
															{
																title: '运算日期',
																width: 200,
																property: {
																	targetClass:
																		'lt.app.require.model.MrpCalculat',
																	fieldTitle: '运算日期',
																	fieldTypeFlag: '0',
																	topFieldType: 'java.util.Date',
																	fieldType: 'java.util.Date',
																	fieldName: 'operatDate',
																	topFieldTypeFlag: '0',
																},
																_DATA_TYPE: 'children',
																dateFormatter: 'YYYY-MM-DD HH:mm:ss',
																dataType: 'date',
																editType: 'date',
															},
															{
																title: '制单日期',
																width: 200,
																property: {
																	targetClass:
																		'lt.app.require.model.MrpCalculat',
																	fieldTitle: '制单日期',
																	fieldTypeFlag: '0',
																	topFieldType: 'java.util.Date',
																	fieldType: 'java.util.Date',
																	fieldName: 'createDate',
																	topFieldTypeFlag: '0',
																},
																_DATA_TYPE: 'children',
																dateFormatter: 'YYYY-MM-DD HH:mm:ss',
																dataType: 'date',
																editType: 'date',
															},
															{
																title: '起始日期',
																width: 200,
																property: {
																	targetClass:
																		'lt.app.require.model.MrpCalculat',
																	fieldTitle: '起始日期',
																	fieldTypeFlag: '0',
																	topFieldType: 'java.util.Date',
																	fieldType: 'java.util.Date',
																	fieldName: 'startDate',
																	topFieldTypeFlag: '0',
																},
																_DATA_TYPE: 'children',
																dateFormatter: 'YYYY-MM-DD HH:mm:ss',
																dataType: 'date',
																editType: 'date',
															},
															{
																title: '截止日期',
																width: 200,
																property: {
																	targetClass:
																		'lt.app.require.model.MrpCalculat',
																	fieldTitle: '截止日期',
																	fieldTypeFlag: '0',
																	topFieldType: 'java.util.Date',
																	fieldType: 'java.util.Date',
																	fieldName: 'endDate',
																	topFieldTypeFlag: '0',
																},
																_DATA_TYPE: 'children',
																dateFormatter: 'YYYY-MM-DD HH:mm:ss',
																dataType: 'date',
																editType: 'date',
															},
															{
																title: '审核日期',
																width: 200,
																property: {
																	targetClass:
																		'lt.app.require.model.MrpCalculat',
																	fieldTitle: '审核日期',
																	fieldTypeFlag: '0',
																	topFieldType: 'java.util.Date',
																	fieldType: 'java.util.Date',
																	fieldName: 'checkDate',
																	topFieldTypeFlag: '0',
																},
																_DATA_TYPE: 'children',
																editType: 'disabledEdit',
																dateFormatter: 'YYYY-MM-DD HH:mm:ss',
																dataType: 'date',
																timeFormatter: 'HH:mm:ss',
																codeType: 'qrCode',
															},
															{
																title: '姓名',
																width: 200,
																property: {
																	targetClass:
																		'lt.app.require.model.MrpCalculat',
																	fieldTitle: '姓名',
																	fieldTypeFlag: '0',
																	topFieldType: 'lt.fw.core.model.biz.Employee',
																	fieldType: 'java.lang.String',
																	fieldName: 'checker.name',
																	topFieldTypeFlag: '1',
																},
																_DATA_TYPE: 'children',
																editType: 'disabledEdit',
																dataType: 'text',
															},
														],
														onRefresh: {
															type: 'JSFunction',
															value:
																'function(){ return this.findMain.apply(this,Array.prototype.slice.call(arguments).concat([{}])) }',
														},
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
																	'function(){ return this.findMain.apply(this,Array.prototype.slice.call(arguments).concat([{}])) }',
															},
														},
														data: {
															type: 'JSExpression',
															value: 'this.$data.mainData',
														},
														loading: {
															type: 'JSExpression',
															value: 'this.$data.mainLoading',
														},
														buttons: [
															{
																id: 'button_mcbrxk09',
																label: '保存',
																mode: 'button',
																type: 'primary',
																validate: 'none',
																onClick: {
																	type: 'JSFunction',
																	value:
																		'function(){ return this.onSave.apply(this,Array.prototype.slice.call(arguments).concat([{}])) }',
																},
															},
															{
																id: 'button_mcbry42x',
																label: '删除',
																mode: 'button',
																type: 'default',
																validate: 'none',
																onClick: {
																	type: 'JSFunction',
																	value:
																		'function(){ return this.onDeleteMrpCalculats.apply(this,Array.prototype.slice.call(arguments).concat([{}])) }',
																},
															},
														],
													},
													docId: 'docmcba46o0',
													hidden: false,
													title: '',
													isLocked: false,
													condition: true,
													conditionGroup: '',
												},
											],
											title: '插槽容器',
											id: 'node_ocmcb9vpw85',
										},
									},
									{
										key: 'pane-item-2',
										children: {
											type: 'JSSlot',
											value: [
												{
													componentName: 'Tabs',
													id: 'node_ocmcba3nkw2',
													props: {
														items: [
															{
																label: '工厂',
																key: '工厂',
																children: {
																	type: 'JSSlot',
																	value: [
																		{
																			componentName: 'Table',
																			id: 'node_ocmcba3nkw9',
																			props: {
																				rowSelectorConfig: {
																					visible: true,
																					type: 'checkbox',
																					width: 60,
																					trigger: 'cell',
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
																				tableId: 'lt_table_mcba4vdr',
																				ref: 'lt_modal_mcba4vdr',
																				targetClass:
																					'lt.app.require.model.MrpCalculatLine',
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
																							'function(){ return this.findLines.apply(this,Array.prototype.slice.call(arguments).concat([{}])) }',
																					},
																				},
																				columns: [
																					{
																						title: '主计划生产单号',
																						width: 200,
																						property: {
																							targetClass:
																								'lt.app.require.model.MrpCalculatLine',
																							fieldTitle: '单号',
																							fieldTypeFlag: '0',
																							topFieldType:
																								'lt.app.product.model.MainProductPlanLine',
																							fieldType: 'java.lang.String',
																							fieldName:
																								'mainProductPlanLine.parent.code',
																							topFieldTypeFlag: '1',
																						},
																						_DATA_TYPE: 'children',
																						dataType: 'link',
																						editType: 'customEntity',
																						onLinkClick: {
																							type: 'JSFunction',
																							value:
																								'function(){ return this.onLinkMinxiClick.apply(this,Array.prototype.slice.call(arguments).concat([{}])) }',
																						},
																					},
																					{
																						title: '净需求',
																						width: 200,
																						property: {
																							targetClass:
																								'lt.app.require.model.MrpCalculatLine',
																							fieldTitle: '净需求',
																							fieldTypeFlag: '0',
																							topFieldType:
																								'java.math.BigDecimal',
																							fieldType: 'java.math.BigDecimal',
																							fieldName: 'netDemandQuantity',
																							topFieldTypeFlag: '0',
																						},
																						_DATA_TYPE: 'children',
																						digits: 0,
																						dataType: 'number',
																						editType: 'number',
																						dateFormatter:
																							'YYYY-MM-DD HH:mm:ss',
																						timeFormatter: 'HH:mm:ss',
																						codeType: 'qrCode',
																					},
																				],
																				data: {
																					type: 'JSExpression',
																					value: 'this.$data.GCData',
																				},
																				loading: {
																					type: 'JSExpression',
																					value: 'this.$data.lineLoading',
																				},
																				onRefresh: {
																					type: 'JSFunction',
																					value:
																						'function(){ return this.findLines.apply(this,Array.prototype.slice.call(arguments).concat([{}])) }',
																				},
																				footerConfig: {
																					showFooter: true,
																					footerItems: [
																						{
																							label: '合计',
																							fields: ['netDemandQuantity'],
																							footerDataMethod: {
																								type: 'JSFunction',
																								value:
																									'function(){ return this.footerDataMethod.apply(this,Array.prototype.slice.call(arguments).concat([{}])) }',
																							},
																						},
																					],
																				},
																				buttons: [],
																			},
																			docId: 'docmcba46o0',
																			hidden: false,
																			title: '',
																			isLocked: false,
																			condition: true,
																			conditionGroup: '',
																		},
																	],
																	title: '插槽容器',
																	id: 'node_ocmcba3nkw5',
																},
															},
															{
																label: '委托工厂',
																key: '委托工厂',
																children: {
																	type: 'JSSlot',
																	value: [
																		{
																			componentName: 'Table',
																			id: 'node_ocmcba3nkwa',
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
																				tableId: 'lt_table_mcba5vos',
																				ref: 'lt_modal_mcba5vos',
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
																							'function(){ return this.findLines.apply(this,Array.prototype.slice.call(arguments).concat([{}])) }',
																					},
																				},
																				targetClass:
																					'lt.app.require.model.MrpCalculatLine',
																				data: {
																					type: 'JSExpression',
																					value: 'this.$data.WTGCData',
																				},
																				loading: {
																					type: 'JSExpression',
																					value: 'this.$data.lineLoading',
																				},
																				onRefresh: {
																					type: 'JSFunction',
																					value:
																						'function(){ return this.findLines.apply(this,Array.prototype.slice.call(arguments).concat([{}])) }',
																				},
																			},
																			docId: 'docmcba46o0',
																			hidden: false,
																			title: '',
																			isLocked: false,
																			condition: true,
																			conditionGroup: '',
																		},
																	],
																	title: '插槽容器',
																	id: 'node_ocmcba3nkw6',
																},
															},
															{
																key: '占用信息',
																label: '占用信息',
																children: {
																	type: 'JSSlot',
																	value: [
																		{
																			componentName: 'Table',
																			id: 'node_ocmcba3nkwb',
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
																				tableId: 'lt_table_mcba5ys5',
																				ref: 'lt_modal_mcba5ys5',
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
																							'function(){ return this.findLines.apply(this,Array.prototype.slice.call(arguments).concat([{}])) }',
																					},
																				},
																				targetClass:
																					'lt.app.require.model.MrpCalculatOccupy',
																				data: {
																					type: 'JSExpression',
																					value: 'this.$data.ZYXXData',
																				},
																				loading: {
																					type: 'JSExpression',
																					value: 'this.$data.lineLoading',
																				},
																				onRefresh: {
																					type: 'JSFunction',
																					value:
																						'function(){ return this.findLines.apply(this,Array.prototype.slice.call(arguments).concat([{}])) }',
																				},
																			},
																			docId: 'docmcba46o0',
																			hidden: false,
																			title: '',
																			isLocked: false,
																			condition: true,
																			conditionGroup: '',
																		},
																	],
																	title: '插槽容器',
																	id: 'node_ocmcba3nkw7',
																},
															},
															{
																key: '结果分析',
																label: '结果分析',
																children: {
																	type: 'JSSlot',
																	value: [
																		{
																			componentName: 'Table',
																			id: 'node_ocmcba3nkwc',
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
																				tableId: 'lt_table_mcba60qm',
																				ref: 'lt_modal_mcba60qn',
																				pagerConfig: {
																					enabled: false,
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
																							'function(){ return this.findLines.apply(this,Array.prototype.slice.call(arguments).concat([{}])) }',
																					},
																				},
																				targetClass:
																					'lt.app.require.model.MrpCalculatResult',
																				data: {
																					type: 'JSExpression',
																					value: 'this.$data.JGFXData',
																				},
																				loading: {
																					type: 'JSExpression',
																					value: 'this.$data.lineLoading',
																				},
																				onRefresh: {
																					type: 'JSFunction',
																					value:
																						'function(){ return this.findLines.apply(this,Array.prototype.slice.call(arguments).concat([{}])) }',
																				},
																				treeConfig: {
																					transform: false,
																					rowField: 'id',
																					parentField: 'parentId',
																					seqMode: 'default',
																					padding: true,
																					indent: 20,
																					showLine: false,
																					expandAll: false,
																					accordion: false,
																					trigger: 'default',
																				},
																				columns: [
																					{
																						title: '序号',
																						width: 200,
																						property: {
																							targetClass:
																								'lt.app.require.model.MrpCalculatResult',
																							fieldTitle: '序号',
																							fieldTypeFlag: '0',
																							topFieldType: 'java.lang.Long',
																							fieldType: 'java.lang.Long',
																							fieldName: 'orderNumber',
																							topFieldTypeFlag: '0',
																						},
																						_DATA_TYPE: 'children',
																						digits: 0,
																						dataType: 'number',
																						editType: 'number',
																					},
																					{
																						title: '描述',
																						width: 200,
																						property: {
																							targetClass:
																								'lt.app.require.model.MrpCalculatResult',
																							fieldTitle: '描述',
																							fieldTypeFlag: '0',
																							topFieldType: 'java.lang.String',
																							fieldType: 'java.lang.String',
																							fieldName: 'describe',
																							topFieldTypeFlag: '0',
																						},
																						_DATA_TYPE: 'children',
																						dataType: 'text',
																						editType: 'text',
																					},
																				],
																			},
																			docId: 'docmcba46o0',
																			hidden: false,
																			title: '',
																			isLocked: false,
																			condition: true,
																			conditionGroup: '',
																		},
																	],
																	title: '插槽容器',
																	id: 'node_ocmcba3nkw8',
																},
															},
														],
														full: true,
														size: 'middle',
														'v-model:activeKey': {
															type: 'JSExpression',
															value: 'this.$data.activeKey',
														},
														onTabClick: {
															type: 'JSFunction',
															value:
																'function(){ return this.findLines.apply(this,Array.prototype.slice.call(arguments).concat([{}])) }',
														},
													},
													docId: 'docmcba46o0',
													hidden: false,
													title: '',
													isLocked: false,
													condition: true,
													conditionGroup: '',
												},
											],
											title: '插槽容器',
											id: 'node_ocmcb9vpw86',
										},
									},
								],
								vertical: true,
								splitLine: 2,
								width: '100%',
								height: '100%',
							},
							docId: 'docmcba46o0',
							hidden: false,
							title: '',
							isLocked: false,
							condition: true,
							conditionGroup: '',
						},
					],
				},
				{
					componentName: 'Drawer',
					id: 'node_ocmcd2xloo1',
					props: {
						ref: 'lt_drawer_mcd315y3',
						title: '明细',
						width: '70%',
					},
					docId: 'docmcd2xloo',
					hidden: true,
					title: '',
					isLocked: false,
					condition: true,
					conditionGroup: '',
					children: [
						{
							componentName: 'Layout',
							id: 'node_ocmcd2xloo3',
							props: {
								style: {
									height: '600px',
								},
							},
							docId: 'docmcd2xloo',
							hidden: false,
							title: '',
							isLocked: false,
							condition: true,
							conditionGroup: '',
							children: [
								{
									componentName: 'Table',
									id: 'node_ocmcd2xloo4',
									props: {
										rowSelectorConfig: {
											visible: true,
											type: 'checkbox',
											width: 60,
											trigger: 'cell',
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
										tableId: 'lt_table_mcd32bda',
										ref: 'lt_table_mcd32bda',
									},
									docId: 'docmcd2xloo',
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
		},
	],
};
