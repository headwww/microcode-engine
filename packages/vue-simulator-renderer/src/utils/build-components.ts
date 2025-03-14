import { isComponentSchema } from '@arvin-shu/microcode-renderer-core';
import {
	IPublicTypeComponentSchema,
	IPublicTypeNpmInfo,
	IPublicTypeProjectSchema,
} from '@arvin-shu/microcode-types';
import { isObject } from '@arvin-shu/microcode-utils';
import { Component, ComponentOptions, defineComponent, h } from 'vue';

export function getSubComponent(library: any, paths: string[]) {
	const l = paths.length;
	if (l < 1 || !library) {
		return library;
	}
	let i = 0;
	let component: any;
	while (i < l) {
		const key = paths[i]!;
		let ex: any;
		try {
			component = library[key];
		} catch (e) {
			ex = e;
			component = null;
		}
		if (i === 0 && component == null && key === 'default') {
			if (ex) {
				return l === 1 ? library : null;
			}
			component = library;
		} else if (component == null) {
			return null;
		}
		library = component;
		i++;
	}
	return component;
}

export const cached = <R>(fn: (param: string) => R): ((param: string) => R) => {
	const cacheStore: Record<string, any> = {};
	// eslint-disable-next-line func-names
	return function (this: unknown, param: string) {
		// eslint-disable-next-line no-return-assign
		return param in cacheStore
			? cacheStore[param]
			: (cacheStore[param] = fn.call(this, param));
	};
};

const generateHtmlComp = cached((library: string) => {
	if (/^[a-z-]+$/.test(library)) {
		return defineComponent(
			(_, { attrs, slots }) =>
				() =>
					h(library, attrs, slots)
		);
	}
});

export function accessLibrary(library: string | Record<string, unknown>) {
	if (typeof library !== 'string') {
		return library;
	}

	return (window as any)[library] || generateHtmlComp(library);
}

export type ESModule = {
	__esModule: true;
	default: any;
};
export function isESModule(obj: any): obj is ESModule {
	return obj && obj.__esModule;
}

/**
 * 查找组件
 * @param libraryMap 库映射
 * @param componentName 组件名称
 * @param npm 可选的npm信息
 * @returns 返回找到的组件或库
 */
export function findComponent(
	libraryMap: Record<string, string>,
	componentName: string,
	npm?: IPublicTypeNpmInfo
) {
	// 如果没有npm信息，直接访问库并返回组件
	if (!npm) {
		return accessLibrary(componentName);
	}
	// 获取导出名称，优先使用npm中的exportName或componentName
	const exportName = npm.exportName || npm.componentName || componentName;
	// 获取库名称，优先使用库映射中的包名
	const libraryName = libraryMap[npm.package] || exportName;
	// 访问库并获取组件
	const library = accessLibrary(libraryName);
	// 根据npm信息获取子组件路径
	const paths = npm.exportName && npm.subName ? npm.subName.split('.') : [];
	// 如果需要解构，添加导出名称到路径前面
	if (npm.destructuring) {
		paths.unshift(exportName);
	}
	// 如果是ES模块，添加'default'到路径前面
	else if (isESModule(library)) {
		paths.unshift('default');
	}
	// 返回子组件
	return getSubComponent(library, paths);
}

function isMicrocodeProjectSchema(
	data: any
): data is IPublicTypeProjectSchema<IPublicTypeComponentSchema> {
	if (!isObject(data)) {
		return false;
	}

	if (!('componentsTree' in data) || data.componentsTree.length === 0) {
		return false;
	}

	return isComponentSchema(data.componentsTree[0]);
}

/**
 * 构建组件
 * @param libraryMap 库映射
 * @param componentsMap 组件映射
 * @param createComponent 创建低代码组件函数
 */
export function buildComponents(
	libraryMap: Record<string, string>,
	componentsMap: Record<
		string,
		IPublicTypeNpmInfo | IPublicTypeComponentSchema | unknown
	>,
	createComponent?: (schema: any) => any
) {
	const components: any = {};
	Object.keys(componentsMap).forEach((componentName) => {
		let component = componentsMap[componentName];
		if (
			component &&
			(isMicrocodeProjectSchema(component) || isComponentSchema(component))
		) {
			if (isComponentSchema(component)) {
				components[componentName] = createComponent?.({
					version: '',
					componentsMap: [],
					componentsTree: [component],
				});
			} else {
				components[componentName] = createComponent?.(component);
			}
		} else if (isVueComponent(component)) {
			components[componentName] = component;
		} else {
			// 从组件库中查询
			component = findComponent(
				libraryMap,
				componentName,
				component as IPublicTypeNpmInfo
			);
			if (component) {
				components[componentName] = component;
			}
		}
	});

	return components;
}

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
