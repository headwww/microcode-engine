import {
	IPublicApiSetters,
	IPublicModelSettingField,
	IPublicTypeCustomView,
	IPublicTypeRegisteredSetter,
} from '@arvin-shu/microcode-types';
import { createContent, isCustomView } from '@arvin-shu/microcode-utils';
import { VNode } from 'vue';

export interface ISetters extends IPublicApiSetters {}

export class Setters implements ISetters {
	settersMap = new Map<
		string,
		IPublicTypeRegisteredSetter & {
			type: string;
		}
	>();

	// eslint-disable-next-line no-useless-constructor
	constructor(readonly viewName: string = 'global') {
		//
	}

	getSetter = (type: string): IPublicTypeRegisteredSetter | null =>
		this.settersMap.get(type) || null;

	registerSetter = (
		typeOrMaps:
			| string
			| { [key: string]: IPublicTypeCustomView | IPublicTypeRegisteredSetter },
		setter?: IPublicTypeCustomView | IPublicTypeRegisteredSetter
	) => {
		if (typeof typeOrMaps === 'object') {
			Object.keys(typeOrMaps).forEach((type) => {
				this.registerSetter(type, typeOrMaps[type]);
			});
			return;
		}
		if (!setter) {
			return;
		}
		if (isCustomView(setter)) {
			setter = {
				component: setter,
				title:
					(setter as any).displayName || (setter as any).name || 'CustomSetter',
			};
		}

		if (!setter.initialValue) {
			const initial = getInitialFromSetter(setter.component);
			if (initial) {
				setter.initialValue = (field: IPublicModelSettingField) =>
					initial.call(field, field.getValue());
			}
		}
		// @ts-ignore
		this.settersMap.set(typeOrMaps, { type: typeOrMaps, ...setter });
	};

	getSettersMap = () => this.settersMap;

	createSetterContent = (
		setter: any,
		props: Record<string, any>
	): VNode | null => {
		if (typeof setter === 'string') {
			setter = this.getSetter(setter);
			if (!setter) {
				return null;
			}
			if (setter.defaultProps) {
				props = {
					...setter.defaultProps,
					...props,
				};
			}
			setter = setter.component;
		}

		if ('value' in props && typeof props.value === 'undefined') {
			delete props.value;
		}

		return createContent(setter, props);
	};
}
/**
 * 从 setter 中获取初始值函数
 * @param setter setter 组件或配置
 * @returns 返回初始值函数,如果没有找到则返回 null
 *
 * 查找顺序:
 * 1. setter.initial
 * 2. setter.Initial
 * 3. setter.type.initial
 * 4. setter.type.Initial
 */
function getInitialFromSetter(setter: any) {
	return (
		(setter &&
			(setter.initial ||
				setter.Initial ||
				(setter.type && (setter.type.initial || setter.type.Initial)))) ||
		null
	);
}
