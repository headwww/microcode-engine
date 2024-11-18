import { IPublicModelPluginContext } from '@arvin-shu/microcode-types';
/**
 * 组件元数据解析器插件
 * 用于监听资产包变化并更新组件元数据映射表
 * @param designer 设计器实例
 */
export const componentMetaParser = (designer: any) => {
	/**
	 * 插件主函数
	 * @param ctx 插件上下文
	 */
	const fun = (ctx: IPublicModelPluginContext) => ({
		/**
		 * 插件初始化函数
		 * 监听资产包变化,并在变化时重新构建组件元数据映射表
		 */
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
