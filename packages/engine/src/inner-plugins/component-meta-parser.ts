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
