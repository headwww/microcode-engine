<script setup lang="ts">
import { MicrocodeWorkbench } from '@arvin-shu/microcode-engine';
import { EditorConfig } from '@arvin-shu/microcode-types';
import { ref, watch } from 'vue';
import { ExpressionBuilder } from './plugins/materials';
import { Expression } from './plugins/materials/expression-builder/types';
// import { http } from './utils/http';
// http.post({ url: 'api/login', data: ['system', '123456'] });

const config: EditorConfig = {
	lifeCycles: {
		init: (e: any) => {
			console.log('init', e);
		},
		destroy: (e: any) => {
			console.log('destroy', e);
		},
	},
	hooks: [
		{
			type: 'on',
			message: 'hooks1',
			handler: (e: any) => {
				console.log('hooks', e);
			},
		},
		{
			type: 'once',
			message: 'hooks2',
			handler: (e: any) => {
				console.log('hooks', e);
			},
		},
	],
};

const value = ref<Expression[]>([
	{
		id: 'groupm9zp6if6',
		type: 'group',
		logicOperator: 'AND',
		children: [
			{
				id: 'singlem9zp6if7',
				parentId: 'groupm9zp6if6',
				type: 'single',
				params: {
					targetClass: 'lt.app.common.model.Store',
					fieldTypeFlag: '2',
					enumInfo: [
						{
							value: '集团',
							key: 'HEAD',
						},
						{
							value: '公司',
							key: 'SUBSIDIARY',
						},
						{
							value: '工厂',
							key: 'FACTORY',
						},
					],
					topFieldType: 'lt.fw.core.model.biz.Dept',
					fieldType: 'lt.fw.core.model.biz.Corp$CorpType',
					fieldName: 'dept.corp.type',
					topFieldTypeFlag: '1',
				},
			},
		],
	},
]);

const refExpressionBuilder = ref<any>();

watch(value, (val) => {
	console.log(val, refExpressionBuilder.value.getExpressionAndOrdinalParams());
});
</script>

<template>
	<ExpressionBuilder
		ref="refExpressionBuilder"
		targetClass="lt.app.common.model.Store"
		v-model:value="value"
	/>
	<MicrocodeWorkbench
		:config="config"
		className="engine-main"
	></MicrocodeWorkbench>
</template>
