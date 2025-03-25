import { createSettingFieldView } from '@arvin-shu/microcode-editor-skeleton';
import { settingFieldSymbol } from '@arvin-shu/microcode-shell';
import {
	IPublicModelSettingField,
	IPublicTypeCustomView,
	IPublicTypeFieldConfig,
	IPublicTypeSetterType,
} from '@arvin-shu/microcode-types';
import { isSettingField } from '@arvin-shu/microcode-utils';
import { defineComponent, PropType, ref } from 'vue';

interface ObjectSetterConfig {
	items?: IPublicTypeFieldConfig[];
	extraSetter?: IPublicTypeSetterType;
	canCloseByOutSideClick: boolean;
}

export const ObjectSetter = defineComponent({
	name: 'ObjectSetter',
	props: {
		value: null,
		field: Object as PropType<IPublicModelSettingField>,
		config: Object as PropType<ObjectSetterConfig>,
	},
	setup(props) {
		console.log(props.config);

		return () => <FormSetter {...props}></FormSetter>;
	},
});

export const FormSetter = defineComponent({
	name: 'FormSetter',
	inheritAttrs: false,
	props: {
		field: Object as PropType<IPublicModelSettingField>,
		config: Object as PropType<ObjectSetterConfig>,
	},
	setup(props) {
		const items = ref<IPublicModelSettingField[]>([]);

		const { config, field } = props;
		const { extraProps } = field || {};
		if (Array.isArray(field?.items) && field?.items.length > 0) {
			field?.items.forEach(
				(item: IPublicModelSettingField | IPublicTypeCustomView) => {
					if (isSettingField(item)) {
						const originalSetValue = item.extraProps.setValue;
						item.extraProps.setValue = (...args) => {
							// 调用子字段本身的 setValue
							// eslint-disable-next-line prefer-spread
							originalSetValue?.apply(null, args);
							// 调用父字段本身的 setValue
							extraProps?.setValue?.apply(null, args);
						};
					}
				}
			);
			items.value = field?.items as any;
		} else {
			items.value = (config?.items || []).map(
				(conf) =>
					field?.createField({
						...conf,
						setValue: extraProps?.setValue,
					}) as any
			);
		}

		return () => (
			<div>
				{items.value.map((item, index) =>
					createSettingFieldView(
						(item as any)[settingFieldSymbol] || item,
						props.field as any,
						index
					)
				)}
			</div>
		);
	},
});
