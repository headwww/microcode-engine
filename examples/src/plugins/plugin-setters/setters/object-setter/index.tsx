import {
	createSettingFieldView,
	PopupPipeKey,
} from '@arvin-shu/microcode-editor-skeleton';
import { settingFieldSymbol } from '@arvin-shu/microcode-shell';
import {
	IPublicModelSettingField,
	IPublicTypeCustomView,
	IPublicTypeFieldConfig,
	IPublicTypeSetterType,
	IPublicTypeTitleContent,
} from '@arvin-shu/microcode-types';
import { isSettingField } from '@arvin-shu/microcode-utils';
import {
	defineComponent,
	inject,
	PropType,
	ref,
	toRaw,
	watchEffect,
} from 'vue';
import './index.scss';
import { Button } from 'ant-design-vue';
import { Title } from '@arvin-shu/microcode-editor-core';
import { EditIcon } from './icons/edit';

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
		mode: String as PropType<'form' | 'popup'>,
		// 1: in tablerow  2: in listrow 3: in column-cell
		forceInline: Number,
	},
	setup(props) {
		return () => {
			const { mode, forceInline = 0, ...restProps } = props;

			if (forceInline || mode === 'popup') {
				if (forceInline > 2 || mode === 'popup') {
					return <RowSetter {...restProps} primaryButton={!forceInline} />;
				}
				return <RowSetter columns={forceInline > 1 ? 2 : 4} {...restProps} />;
			}
			return <FormSetter {...restProps} />;
		};
	},
});

export function getItemsFromProps(props: any) {
	const { config, field, columns } = props;
	const { extraProps } = field;
	const items: IPublicModelSettingField[] = [];

	if (columns && config?.items) {
		const l = Math.min(config.items.length, columns);
		for (let i = 0; i < config.items.length; i++) {
			const conf = config.items[i];
			if (conf.isRequired || conf.important || conf.setter?.isRequired) {
				const item = field.createField({
					...conf,
					forceInline: 3,
				});

				const originalSetValue = item.extraProps.setValue;
				item.extraProps.setValue = (...args: any) => {
					// eslint-disable-next-line prefer-spread
					originalSetValue?.apply(null, args);
					extraProps.setValue?.apply(null, args);
				};

				items.push(item);
			}
			if (items.length >= l) break;
		}
	}
	return items;
}

export const RowSetter = defineComponent({
	name: 'RowSetter',
	inheritAttrs: false,
	props: {
		value: null,
		field: {
			type: Object as PropType<IPublicModelSettingField>,
		},
		descriptor: Object as PropType<IPublicTypeTitleContent>,
		config: {
			type: Object as PropType<ObjectSetterConfig>,
		},
		columns: Number,
		primaryButton: Boolean,
	},
	setup(props) {
		const items = ref<any>([]);

		const context = inject(PopupPipeKey, null);
		const pipe = context?.create({
			width: 320,
		});

		const descriptorText = ref('');

		watchEffect(() => {
			items.value = getItemsFromProps(props);
			const descriptor: any = props.descriptor;
			if (descriptor) {
				if (typeof descriptor === 'function') {
					descriptorText.value = descriptor(props.field);
				} else {
					descriptorText.value = props.field?.getPropValue(descriptor);
				}
			} else {
				descriptorText.value = props.field?.title || '';
			}
		});

		return () => {
			pipe?.sent(
				<FormSetter
					key={props.field?.id}
					field={props.field}
					config={props.config}
				></FormSetter>,
				<Title title={descriptorText.value}></Title>
			);

			return (
				<div className="mtc-setter-object-row">
					<Button
						type="text"
						icon={<EditIcon />}
						onClick={(e) =>
							pipe?.show(e.target as HTMLElement, props.field?.id)
						}
					></Button>

					{items.value && items.value.length ? (
						items.value.map((item: any, index: number) =>
							createSettingFieldView(
								toRaw((item as any)[settingFieldSymbol]) || item,
								toRaw(props.field) as any,
								index
							)
						)
					) : (
						<div class="mtc-setter-object-row-body">
							{`${descriptorText.value}: 未配置快捷编辑项`}
						</div>
					)}
				</div>
			);
		};
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
				(conf: any) =>
					field?.createField({
						...conf,
						setValue: extraProps?.setValue,
					}) as any
			);
		}

		return () => (
			<div class="mtc-setter-object mtc-block-setter">
				{items.value.map((item: any, index) =>
					createSettingFieldView(
						toRaw((item as any)[settingFieldSymbol]) || item,
						toRaw(props.field) as any,
						index
					)
				)}
			</div>
		);
	},
});
