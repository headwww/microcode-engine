import { IPublicTypeFieldConfig } from '@arvin-shu/microcode-types';
import { isVNode } from 'vue';
import { ISettingField } from './setting-field';

export class Transducer {
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
	}
}
