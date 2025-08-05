import {
	IPublicTypeSetterConfig,
	IPublicTypeCustomView,
	IPublicTypeDynamicSetter,
	IPublicTypeTitleContent,
	IPublicTypeDynamicProps,
	IPublicModelSettingField,
} from '@arvin-shu/microcode-types';
import { setters as shellSetters } from '@arvin-shu/microcode-engine';
import { isSetterConfig } from '@arvin-shu/microcode-utils';

export interface SetterItem {
	name: string;
	title: IPublicTypeTitleContent;
	setter: string | IPublicTypeDynamicSetter | IPublicTypeCustomView;
	props?: Record<string, unknown> | IPublicTypeDynamicProps;
	condition?: (field: IPublicModelSettingField) => boolean;
	initialValue?: any | ((field: IPublicModelSettingField) => any);
	list: boolean;
	valueType: string[];
}

export function nomalizeSetters(
	setters?: Array<
		| string
		| IPublicTypeSetterConfig
		| IPublicTypeCustomView
		| IPublicTypeDynamicSetter
	>
): SetterItem[] {
	if (!setters) {
		const normalized: SetterItem[] = [];
		shellSetters.getSettersMap().forEach((setter, name) => {
			if (name === 'MixedSetter') {
				return;
			}
			normalized.push({
				name,
				title: setter.title || name,
				setter: name,
				condition: setter.condition,
				initialValue: setter.initialValue,
				list: setter.recommend || false,
				// @ts-ignore
				valueType: setter.valueType,
			});
		});

		return normalized;
	}
	const names: string[] = [];
	function generateName(n: string) {
		let idx = 1;
		let got = n;
		while (names.indexOf(got) > -1) {
			got = `${n}:${idx++}`;
		}
		names.push(got);
		return got;
	}
	const formattedSetters = setters.map((setter) => {
		const config: any = {
			setter,
			list: true,
		};
		if (isSetterConfig(setter)) {
			config.setter = setter.componentName;
			config.props = setter.props;
			config.condition = setter.condition;
			config.initialValue = setter.initialValue;
			config.title = setter.title;
			config.valueType = setter.valueType;
		}
		if (typeof config.setter === 'string') {
			config.name = config.setter;
			names.push(config.name);
			const info = shellSetters.getSetter(config.setter);
			if (!config.title) {
				config.title = info?.title || config.setter;
			}
			if (!config.valueType) {
				// @ts-ignore
				config.valueType = info?.valueType;
			}
			if (!config.condition) {
				config.condition = info?.condition;
			}
			if (!config.initialValue) {
				config.initialValue = info?.initialValue;
			}
		} else {
			config.name = generateName(
				(config.setter as any)?.displayName ||
					(config.setter as any)?.name ||
					'CustomSetter'
			);
			if (!config.title) {
				config.title = config.name;
			}
		}
		return config;
	});
	const uniqSetters = formattedSetters.reduce((map, s) => {
		map.set(s.name, s);
		return map;
	}, new Map<string, any>());

	const hasComplexSetter = formattedSetters.filter((item) =>
		['ArraySetter', 'ObjectSetter'].includes(item.setter)
	).length;
	return [...uniqSetters.values()].map((item) => {
		if (item.setter === 'VariableSetter' && hasComplexSetter) {
			item.setter = 'ExpressionSetter';
			item.name = 'ExpressionSetter';
		}
		return item;
	});
}

const dash = '_';
export function getMixedSelect(field: any) {
	const path = field.path || [];
	if (path.length) {
		const key = `_unsafe_MixedSetter${dash}${path[path.length - 1]}${dash}select`;
		const newPath = [...path];
		newPath.splice(path.length - 1, 1, key);
		const newKey = field.node.getPropValue(newPath.join('.'));
		if (newKey) return newKey;
		// 兼容下以前的问题情况，如果捕获到，获取 oldUnsafeKey 取值并将其直接置空
		const oldUnsafeKey = `_unsafe_MixedSetter${dash}${path.join(dash)}${dash}select`;
		const oldUsedSetter = field.node.getPropValue(oldUnsafeKey);
		if (oldUsedSetter) {
			field.node.setPropValue(newPath.join('.'), oldUsedSetter);
			field.node.setPropValue(oldUnsafeKey, undefined);
		}
		return oldUsedSetter;
	}
	return undefined;
}
export function setMixedSelect(field: any, usedSetter: any) {
	const path = field.path || [];
	if (path.length) {
		const key = `_unsafe_MixedSetter${dash}${path[path.length - 1]}${dash}select`;
		path.splice(path.length - 1, 1, key);
		field.node.setPropValue(path.join('.'), usedSetter);
	}
}
