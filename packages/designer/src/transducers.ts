import { IPublicTypeTransformedComponentMetadata as Metadata } from '@arvin-shu/microcode-types';

/**
 * 设置组件的默认嵌套规则
 * 根据组件名称的模式自动设置组件的嵌套规则：
 * 1. 如果组件名以 .Group 结尾：设置可以包含哪些子组件
 * 2. 如果组件名以 .Node 结尾：设置可以被哪些父组件包含
 * 3. 如果组件名以 .Item、.Node 或 .Option 结尾：设置可以被哪些父组件包含
 *
 * 例如：
 * - Select.Group 将被设置为只能包含 Select 组件
 * - Tree.Node 将被设置为只能被 Tree 或 Tree.Node 包含
 * - Menu.Item 将被设置为只能被 Menu 包含
 */
export function componentDefaults(metadata: Metadata): Metadata {
	const { configure, componentName } = metadata;
	const { component = {} } = configure;
	if (!component.nestingRule) {
		let m;
		// eslint-disable-next-line no-cond-assign
		if ((m = /^(.+)\.Group$/.exec(componentName))) {
			component.nestingRule = {
				childWhitelist: [`${m[1]}`],
			};
			// eslint-disable-next-line no-cond-assign
		} else if ((m = /^(.+)\.Node$/.exec(componentName))) {
			component.nestingRule = {
				parentWhitelist: [`${m[1]}`, componentName],
			};
			// eslint-disable-next-line no-cond-assign
		} else if ((m = /^(.+)\.(Item|Node|Option)$/.exec(componentName))) {
			component.nestingRule = {
				parentWhitelist: [`${m[1]}`],
			};
		}
	}
	return {
		...metadata,
		configure: {
			...configure,
			component,
		},
	};
}
