import { ComponentOptions, Component } from 'vue';

/**
 * 判断是否是组件
 *
 * @param component
 * @returns
 */
export function isVueComponent(component: any): component is Component {
	if (typeof component === 'object' && component !== null) {
		const options = component as ComponentOptions;
		if (
			typeof options.render === 'function' ||
			typeof options.setup === 'function'
		) {
			return true; // 是 SFC 组件
		}
	}
	if (
		typeof component === 'object' &&
		component !== null &&
		'__vccOpts' in component
	) {
		return true; // 是 Vue JSX 组件
	}

	return false; // 不是任何组件
}
