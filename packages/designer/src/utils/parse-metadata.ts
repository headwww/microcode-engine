import { Component } from 'vue';

// 定义基础类型接口
interface IMicrocodeType {
	type: string;
	isRequired?: boolean;
	defaultValue?: any;
	validator?: (value: any) => boolean;
	description?: string;
}

interface IMicrocodeProp {
	name: string;
	propType: IMicrocodeType;
	description?: string;
}

// Vue 3 类型映射
const Vue3Types = {
	String: {
		type: 'string',
		tsType: String,
	},
	Number: {
		type: 'number',
		tsType: Number,
	},
	Boolean: {
		type: 'boolean',
		tsType: Boolean,
	},
	Array: {
		type: 'array',
		tsType: Array,
	},
	Object: {
		type: 'object',
		tsType: Object,
	},
	Function: {
		type: 'function',
		tsType: Function,
	},
	Date: {
		type: 'date',
		tsType: Date,
	},
	Symbol: {
		type: 'symbol',
		tsType: Symbol,
	},
};

// 工具函数：获取类型
function getPropertyType(type: any): string {
	if (!type) return 'any';

	// 处理原始类型
	for (const [key, value] of Object.entries(Vue3Types)) {
		key;
		if (type === value.tsType) {
			return value.type;
		}
	}

	// 处理数组类型
	if (Array.isArray(type)) {
		const arrayType = type[0];
		return `array<${getPropertyType(arrayType)}>`;
	}

	// 处理联合类型
	if (type.__unionTypes) {
		return `oneOf<${type.__unionTypes.map((t: any) => getPropertyType(t)).join('|')}>`;
	}

	// 处理对象类型
	if (typeof type === 'object') {
		return 'object';
	}

	return 'any';
}

/**
 * 解析 Props
 */
function parseVue3Props(component: Component): IMicrocodeProp[] {
	const props: IMicrocodeProp[] = [];
	// @ts-ignore
	const componentProps = component.props || {};

	Object.entries(componentProps).forEach(([propName, propConfig]) => {
		const prop: IMicrocodeProp = {
			name: propName,
			propType: {
				type: 'any',
				isRequired: false,
			},
		};

		if (typeof propConfig === 'object' && propConfig !== null) {
			// 处理完整的 prop 配置
			const config = propConfig as any;

			prop.propType = {
				type: getPropertyType(config.type),
				isRequired: !!config.required,
				defaultValue: config.default,
				validator: config.validator,
			};

			if (config.description) {
				prop.description = config.description;
			}
		} else if (Array.isArray(propConfig)) {
			// 处理类型数组
			prop.propType.type = propConfig.map((t) => getPropertyType(t)).join('|');
		} else {
			// 处理单个类型
			prop.propType.type = getPropertyType(propConfig);
		}

		props.push(prop);
	});

	return props;
}

/**
 * 主解析函数
 */
export function parseMetadata(component: any) {
	return {
		props: parseVue3Props(component),
		...component?.componentMetadata,
	} as any;
}
