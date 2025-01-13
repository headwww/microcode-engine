/*
 * @Author: shuwen 1243889238@qq.com
 * @Date: 2024-11-12 14:54:17
 * @LastEditors: shuwen 1243889238@qq.com
 * @LastEditTime: 2025-01-07 17:13:50
 * @FilePath: /microcode-engine/packages/engine/src/inner-plugins/component-meta-parser.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { IPublicModelPluginContext } from '@arvin-shu/microcode-types';
/**
 * 组件元数据解析器插件
 * 用于监听资产包变化并更新组件元数据映射表
 * @param designer 设计器实例
 */
export const componentMetaParser = (designer: any) => {
	const fun = (ctx: IPublicModelPluginContext) => ({
		init() {
			const { material } = ctx;
			material.onChangeAssets(() => {
				const assets = material.getAssets();
				// 使用资产包中的组件列表构建元数据映射表
				designer.buildComponentMetasMap(assets?.components || []);
			});
		},
	});

	// 设置插件名称
	fun.pluginName = '____component_meta_parser____';

	return fun;
};
