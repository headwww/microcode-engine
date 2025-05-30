import {
	IPublicTypeFieldConfig,
	IPublicTypeSetterConfig,
} from '@arvin-shu/microcode-types';
import { isVNode } from 'vue';
import { isDynamicSetter, isSetterConfig } from '@arvin-shu/microcode-utils';
import { ISettingField } from './setting-field';

function getHotterFromSetter(setter: any) {
	return (
		(setter && (setter.Hotter || (setter.type && setter.type.Hotter))) || []
	); // eslint-disable-line
}

function getTransducerFromSetter(setter: any) {
	return (
		(setter &&
			(setter.transducer ||
				setter.Transducer ||
				(setter.type && (setter.type.transducer || setter.type.Transducer)))) ||
		null
	); // eslint-disable-line
}

function combineTransducer(transducer: any, arr: any, context: any) {
	if (!transducer && Array.isArray(arr)) {
		const [toHot, toNative] = arr;
		transducer = { toHot, toNative };
	}

	return {
		toHot: ((transducer && transducer.toHot) || ((x: any) => x)).bind(context), // eslint-disable-line
		toNative: ((transducer && transducer.toNative) || ((x: any) => x)).bind(
			context
		), // eslint-disable-line
	};
}

export class Transducer {
	setterTransducer: any;

	context: any;

	constructor(
		context: ISettingField,
		config: { setter: IPublicTypeFieldConfig['setter'] }
	) {
		let { setter } = config;

		if (Array.isArray(setter)) {
			setter = setter[0];
		} else if (
			isVNode(setter) &&
			setter.type &&
			typeof setter.type === 'object' &&
			(setter.type as any).name === 'MixedSetter'
		) {
			setter = setter.props?.setters?.[0];
		} else if (
			typeof setter === 'object' &&
			(setter as any).componentName === 'MixedSetter'
		) {
			setter = Array.isArray(setter?.props?.setters) && setter.props.setters[0];
		}

		/**
		 * 两种方式标识是 FC 而不是动态 setter
		 * 1. 物料描述里面 setter 的配置，显式设置为 false
		 * 2. registerSetter 注册 setter 时显式设置为 false
		 */

		let isDynamic = true;

		if (isSetterConfig(setter)) {
			const { componentName, isDynamic: dynamicFlag } =
				setter as IPublicTypeSetterConfig;
			setter = componentName;
			isDynamic = dynamicFlag !== false;
		}
		if (typeof setter === 'string') {
			const { component, isDynamic: dynamicFlag } =
				context.setters.getSetter(setter) || {};
			setter = component;
			// 如果在物料配置中声明了，在 registerSetter 没有声明，取物料配置中的声明
			isDynamic = dynamicFlag === undefined ? isDynamic : dynamicFlag !== false;
		}
		if (isDynamicSetter(setter) && isDynamic) {
			try {
				setter = setter.call(
					context.internalToShellField(),
					context.internalToShellField()
				);
			} catch (e) {
				// eslint-disable-next-line no-console
				console.error(e);
			}
		}

		this.setterTransducer = combineTransducer(
			getTransducerFromSetter(setter),
			getHotterFromSetter(setter),
			context
		);
		this.context = context;
	}

	toHot(data: any) {
		return this.setterTransducer.toHot(data);
	}

	toNative(data: any) {
		return this.setterTransducer.toNative(data);
	}
}
