import { IPublicTypeCustomView } from '@arvin-shu/microcode-types';

export function isCustomView(obj: any): obj is IPublicTypeCustomView {
	if (!obj) {
		return false;
	}

	// instanceof 检查
	if (obj instanceof Object && '_isVNode' in obj) {
		return true;
	}

	// 组件实例检查
	if (obj?.$) {
		return true;
	}

	// 组件定义检查
	if (typeof obj === 'object') {
		return !!(
			obj.render ||
			obj.setup ||
			obj.template ||
			obj.components ||
			obj.__file
		);
	}

	// 函数式组件检查
	return typeof obj === 'function';
}
