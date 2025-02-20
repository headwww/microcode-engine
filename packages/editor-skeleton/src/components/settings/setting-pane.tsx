import {
	IComponentMeta,
	ISettingEntry,
	ISettingField,
	ISettingTopEntry,
} from '@arvin-shu/microcode-designer';
import { IPublicTypeCustomView } from '@arvin-shu/microcode-types';
import {
	createContent,
	isJSSlot,
	isObject,
	isSetterConfig,
	shouldUseVariableSetter,
} from '@arvin-shu/microcode-utils';
import { computed, defineComponent, onMounted, PropType, ref } from 'vue';
import { engineConfig, shallowIntl } from '@arvin-shu/microcode-editor-core';
import { createField } from '../field';
import { PopupPipe, PopupService } from '../popup';
import { Skeleton } from '../../skeleton';

/**
 * 判断是否为标准组件
 * @param componentMeta 组件元数据
 * @returns 如果是标准组件返回true,否则返回false
 * 标准组件的判断依据:
 * 1. componentMeta不为空
 * 2. prototype属性为null
 */
function isStandardComponent(componentMeta: IComponentMeta | null) {
	if (!componentMeta) return false;
	const { prototype } = componentMeta;
	return prototype == null;
}

export const SettingPane = defineComponent({
	name: 'SettingPane',
	inheritAttrs: false,
	props: {
		target: Object as PropType<ISettingTopEntry | ISettingField>,
	},
	setup(props) {
		return () => {
			const { target } = props;
			const { items } = target!;
			const popupPipe = new PopupPipe();
			popupPipe.create();

			return (
				<div class="mtc-settings-pane">
					<PopupService popupPipe={popupPipe}>
						<div className="mtc-settings-content">
							{items.map((item, index) =>
								createSettingFieldView(item, target!, index)
							)}
						</div>
					</PopupService>
				</div>
			);
		};
	},
});

export function createSettingFieldView(
	field: ISettingField | IPublicTypeCustomView,
	fieldEntry: ISettingEntry,
	index?: number
) {
	if (isSettingField(field)) {
		if (field.isGroup) {
			return <SettingGroupView field={field} key={field.id} />;
		}
		return <SettingFieldView field={field} key={field.id} />;
	}
	return createContent(field, { key: index, field: fieldEntry });
}

/**
 * 判断 initialValue 是否为非空，非空条件：
 *  1. 当为 slot 结构时，value 为有长度的数组且 visible 不为 false
 *  2. 不为 slot 结构，为非 undefined / null 值
 * @param initialValue
 * @returns
 */
function isInitialValueNotEmpty(initialValue: any) {
	if (isJSSlot(initialValue)) {
		return (
			// @ts-ignore visible 为 false 代表默认不展示
			initialValue.visible !== false &&
			Array.isArray(initialValue.value) &&
			initialValue.value.length > 0
		);
	}
	return initialValue !== undefined && initialValue !== null;
}

export const SettingFieldView = defineComponent({
	name: 'SettingFieldView',
	inheritAttrs: false,
	props: {
		field: Object as PropType<ISettingField>,
	},
	setup(props) {
		const editor = props.field?.designer?.editor;

		const setters = editor?.get('setters');

		const { field } = props;
		const { extraProps } = field!;
		const { display } = extraProps;

		const skeleton = editor?.get('skeleton') as Skeleton;
		const { stages } = skeleton || {};

		const stageName = ref();

		if (display === 'entry') {
			// watchEffect(() => {
			const name = `${field!.getNode().id}_${field!.name?.toString()}`;
			stages.container.remove(name);
			stages.add({
				type: 'Widget',
				name,
				content: (
					<>
						{field!.items.map((item, index) =>
							createSettingFieldView(item, field!, index)
						)}
					</>
				),
				props: {
					title: field!.title,
				},
			});
			stageName.value = name;

			// });
		}

		const setterInfo = computed(() => {
			const { setter, extraProps, componentMeta } = props.field!;

			const { defaultValue } = extraProps;

			let setterType: any = setter;
			let initialValue: any = null;

			let setterProps: any = {};
			if (Array.isArray(setter)) {
				setterType = 'MixedSetter';
				setterProps = {
					setters: setter,
				};
			} else if (isSetterConfig(setter)) {
				setterType = setter.componentName;
				if (setter.props) {
					setterProps = setter.props;
					if (typeof setterProps === 'function') {
						setterProps = setterProps(props.field?.internalToShellField());
					}
				}
				if (setter.initialValue != null) {
					initialValue = setter.initialValue;
				}
			}

			if (defaultValue != null && !('defaultValue' in setterProps)) {
				setterProps.defaultValue = defaultValue;
				if (initialValue == null) {
					initialValue = defaultValue;
				}
			}

			// 根据是否支持变量配置做相应的更改
			const supportVariable = props.field?.extraProps?.supportVariable;

			const supportVariableGlobally =
				engineConfig.get('supportVariableGlobally', false) &&
				isStandardComponent(componentMeta);

			const isUseVariableSetter = shouldUseVariableSetter(
				supportVariable,
				supportVariableGlobally
			);

			if (isUseVariableSetter === false) {
				return {
					setterProps,
					initialValue,
					setterType,
				};
			}

			if (setterType === 'MixedSetter') {
				// VariableSetter 不单独使用
				if (
					Array.isArray(setterProps.setters) &&
					!setterProps.setters.includes('VariableSetter')
				) {
					setterProps.setters.push('VariableSetter');
				}
			} else {
				setterType = 'MixedSetter';
				setterProps = {
					setters: [setter, 'VariableSetter'],
				};
			}
			return {
				setterType,
				setterProps,
				initialValue,
			};
		});

		const visible = () => {
			if (props.field) {
				const { extraProps } = props.field;
				const { condition } = extraProps;
				try {
					return typeof condition === 'function'
						? condition(props.field.internalToShellField()) !== false
						: true;
				} catch (error) {
					// eslint-disable-next-line no-console
					console.error('exception when condition (hidden) is excuted', error);
				}
			}

			return true;
		};

		const fromOnChange = ref(false);

		const ignoreDefaultValue = () => {
			if (props.field) {
				const { extraProps } = props.field;
				const { ignoreDefaultValue } = extraProps;
				try {
					if (typeof ignoreDefaultValue === 'function') {
						return ignoreDefaultValue(props.field.internalToShellField());
					}
					return false;
				} catch (error) {
					// eslint-disable-next-line no-console
					console.error('exception when ignoreDefaultValue is excuted', error);
				}

				return false;
			}
		};

		const value = ref(props.field?.getValue());

		function initDefaultValue() {
			const { initialValue } = setterInfo.value;
			if (
				fromOnChange.value ||
				!isInitialValueNotEmpty(initialValue) ||
				ignoreDefaultValue() ||
				value.value !== undefined
			) {
				return;
			}
			const _initialValue =
				typeof initialValue === 'function'
					? initialValue(props.field?.internalToShellField())
					: initialValue;
			props.field?.setValue(_initialValue);
		}

		onMounted(() => {
			initDefaultValue();
		});

		return () => {
			const { extraProps, title, componentMeta, expanded, clearValue } =
				props.field!;

			if (!visible()) {
				return <></>;
			}

			const { setterProps = {}, initialValue, setterType } = setterInfo.value;
			const { field } = props;

			return createField(
				{
					meta: componentMeta?.npm || componentMeta?.componentName || '',
					title,
					collapsed: !expanded,
					onExpandChange: (expandState: any) => {
						props.field?.setExpanded(expandState);
					},
					onClear: () => clearValue(),
					stageName: stageName.value,
					...extraProps,
				} as any,
				setters.createSetterContent(setterType, {
					...shallowIntl(setterProps),
					value: value.value,
					forceInline: extraProps.forceInline,
					prop: field?.internalToShellField(), // for compatible vision
					selected: field?.top?.getNode()?.internalToShellNode(),
					field: field?.internalToShellField(),
					key: field?.id,
					initialValue,
					onInitial: () => {
						if (initialValue) {
							return;
						}
						const value =
							typeof initialValue === 'function'
								? initialValue(field?.internalToShellField())
								: initialValue;

						value.value = value;
						field?.setValue(value, true);
					},
					removeProp: () => {
						if (field?.name) {
							field.parent.clearPropValue(field.name);
						}
					},
					onChange: (v: any) => {
						fromOnChange.value = true;
						value.value = v;
						field?.setValue(v, true);
					},
				}),
				extraProps.forceInline ? 'plain' : extraProps.display
			);
		};
	},
});

export const SettingGroupView = defineComponent({
	name: 'SettingGroupView',
	inheritAttrs: false,
	props: {
		field: Object as PropType<ISettingField>,
	},
	setup(props) {
		const editor = props.field?.designer?.editor;

		const { field } = props;
		const { extraProps } = field!;
		const { display } = extraProps;

		const skeleton = editor?.get('skeleton') as Skeleton;
		const { stages } = skeleton || {};

		const stageName = ref();

		if (display === 'entry') {
			// watchEffect(() => {
			const name = `${field!.getNode().id}_${field!.name?.toString()}`;
			stages.container.remove(name);
			stages.add({
				type: 'Widget',
				name,
				content: (
					<>
						{field!.items.map((item, index) =>
							createSettingFieldView(item, field!, index)
						)}
					</>
				),
				props: {
					title: field!.title,
				},
			});
			stageName.value = name;

			// });
		}
		return () => {
			const { field } = props;
			const { extraProps } = field!;
			const { condition, display } = extraProps;
			const visible =
				field?.isSingle && typeof condition === 'function'
					? condition(field.internalToShellField()) !== false
					: true;

			if (!visible) {
				return <></>;
			}

			return createField(
				{
					meta:
						field?.componentMeta?.npm ||
						field?.componentMeta?.componentName ||
						'',
					title: field?.title,
					collapsed: !field?.expanded,
					onExpandChange: (expandState: any) => field?.setExpanded(expandState),
					stageName: stageName.value,
				} as any,
				field?.items.map((item, index) =>
					createSettingFieldView(item, field, index)
				),
				display
			);
		};
	},
});

export function isSettingField(obj: any): obj is ISettingField {
	if (!isObject(obj)) {
		return false;
	}

	return 'isSettingField' in obj && obj.isSettingField;
}
