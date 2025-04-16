import { IPublicModelPluginContext } from '@arvin-shu/microcode-types';
import assets from './assets';
import schema from './schema';

const InitMaterial = (ctx: IPublicModelPluginContext) => ({
	async init() {
		const { material, project } = ctx;

		await material.setAssets(assets as any);

		project.importSchema(schema as any);

		// material.loadIncrementalAssets({
		// 	version: '',
		// 	components: [
		// 		{
		// 			devMode: 'microCode',
		// 			componentName: 'LowcodeDemo',
		// 			title: '低代码组件示例',
		// 			group: '低代码组件',
		// 			category: '组合',
		// 			schema: lowcodeSchema as any,
		// 			snippets: [
		// 				{
		// 					title: '低代码组件示例',
		// 					schema: {
		// 						componentName: 'LowcodeDemo',
		// 					},
		// 				},
		// 			],
		// 		},
		// 	],
		// });
	},
});

InitMaterial.pluginName = 'InitMaterial';

export default InitMaterial;

// const lowcodeSchema = {
// 	version: '1.0.0',
// 	componentsMap: [],
// 	componentsTree: [
// 		{
// 			componentName: 'Component',
// 			id: 'node_dockcviv8f11',
// 			props: {
// 				ref: 'outerView',
// 				style: {
// 					height: '100%',
// 				},
// 			},
// 			docId: 'doclaqkk3b9',
// 			fileName: '/',
// 			hidden: false,
// 			title: '',
// 			isLocked: false,
// 			children: [
// 				{
// 					componentName: 'FCell',
// 					id: 'node_sxsm4wdis232',
// 					children: [
// 						{
// 							componentName: 'LtButton',
// 							id: 'node_sxsm4wdio232',
// 							props: {
// 								children: '测试按钮1',
// 								icon: {
// 									type: 'JSSlot',
// 									value: [
// 										{
// 											componentName: 'Icon',
// 											id: 'node_ocm7lvp0qp3',
// 											props: {
// 												type: 'SmileOutlined',
// 												size: 20,
// 												rotate: 0,
// 												spin: false,
// 											},
// 											hidden: false,
// 											title: '',
// 											isLocked: false,
// 										},
// 									],
// 									id: 'node_ocm7lvp0qp2',
// 								},
// 							},
// 							hidden: false,
// 							title: '',
// 							isLocked: false,
// 							loopArgs: null,
// 						},
// 						{
// 							componentName: 'LtButton',
// 							id: 'node_sxsm4wo222',
// 							props: {
// 								children: '按钮2',
// 								icon: {
// 									type: 'JSSlot',
// 									value: [
// 										{
// 											componentName: 'Icon',
// 											id: 'node_ocm7lvp0qp3',
// 											props: {
// 												type: 'SmileOutlined',
// 												size: 20,
// 												rotate: 0,
// 												spin: false,
// 											},
// 											hidden: false,
// 											title: '',
// 											isLocked: false,
// 										},
// 									],
// 									id: 'node_ocm7lvp0qp2',
// 								},
// 							},
// 							hidden: false,
// 							title: '',
// 							isLocked: false,
// 							loopArgs: null,
// 						},
// 					],
// 				},
// 			],
// 		},
// 	],
// 	i18n: {
// 		'zh-CN': {
// 			'i18n-jwg27yo4': '你好 ',
// 			'i18n-jwg27yo3': '{name} 博士',
// 		},
// 		'en-US': {
// 			'i18n-jwg27yo4': 'Hello ',
// 			'i18n-jwg27yo3': 'Doctor {name}',
// 		},
// 	},
// };
