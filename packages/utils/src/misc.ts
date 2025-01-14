/**
 * 属性级别的 supportVariable 应该优先于全局的 supportVariable
 * @param propSupportVariable 属性级别的 supportVariable
 * @param globalSupportVariable 全局的 supportVariable
 * @returns 是否应该使用变量设置器
 */
export function shouldUseVariableSetter(
	propSupportVariable: boolean | undefined,
	globalSupportVariable: boolean
) {
	if (propSupportVariable === false) return false;
	return propSupportVariable || globalSupportVariable;
}
