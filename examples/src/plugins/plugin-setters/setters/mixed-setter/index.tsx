import {
	computed,
	defineComponent,
	onMounted,
	onUpdated,
	PropType,
	ref,
} from 'vue';
import { SettingField } from '@arvin-shu/microcode-designer';
import {
	IPublicModelSettingField,
	IPublicTypeCustomView,
	IPublicTypeDynamicSetter,
	IPublicTypeSetterConfig,
} from '@arvin-shu/microcode-types';
import { setters } from '@arvin-shu/microcode-engine';
import { shallowIntl, Title } from '@arvin-shu/microcode-editor-core';
import { isDynamicSetter } from '@arvin-shu/microcode-utils';
import { Dropdown, Menu } from 'ant-design-vue';
import {
	getMixedSelect,
	nomalizeSetters,
	setMixedSelect,
	SetterItem,
} from './utils';
import { intlNode } from './locale';
import { VariableIcon } from './icons/variable';
import { ConvertIcon } from './icons/convert';

import './index.scss';
import { YesIcon } from './icons/yes';

const { getSetter, createSetterContent } = setters;

type SettingFieldType = SettingField;

type VariableSetter = IPublicTypeCustomView & {
	show(params: object): void;
};

export const MixedSetter = defineComponent({
	name: 'MixedSetter',
	inheritAttrs: false,
	props: {
		className: String,
		field: Object as PropType<SettingFieldType>,
		setters: Array as PropType<
			Array<
				| string
				| IPublicTypeSetterConfig
				| IPublicTypeCustomView
				| IPublicTypeDynamicSetter
			>
		>,
		value: null,
		initialValue: null,
		forceInline: Number,
		prop: Object as PropType<IPublicModelSettingField>,
		onChange: Function as PropType<(val: any) => void>,
		onInitial: Function as PropType<(val: any) => void>,
		removeProp: {
			type: Function as PropType<() => void>,
		},
	},
	setup(props) {
		const fromMixedSetterSelect = ref(false);

		const { setters: rawSetters, field } = props;

		const setters = nomalizeSetters(rawSetters);

		const usedSetter = getMixedSelect(field);

		const used = ref<string>(usedSetter);

		const triggerNodeRef = ref<HTMLDivElement>();

		const shell = ref<HTMLDivElement>();

		function checkIsBlockField() {
			if (shell.value) {
				const setter = shell.value.firstElementChild;
				if (setter && setter.classList.contains('mtc-block-setter')) {
					shell.value.classList.add('mtc-block-setter');
				} else {
					shell.value.classList.remove('mtc-block-setter');
				}
			}
		}

		onMounted(() => {
			checkIsBlockField();
		});

		onUpdated(() => {
			checkIsBlockField();
		});

		function useSetter(name: string, usedName: string) {
			fromMixedSetterSelect.value = true;
			const { field } = props;
			if (name === 'VariableSetter') {
				const setterComponent = getSetter('VariableSetter')?.component as any;
				if (setterComponent && setterComponent.isPopup) {
					setterComponent.show({ prop: field, node: triggerNodeRef.value });
					syncSelectSetter(name);
					return;
				}
			} else {
				// 变量类型直接设undefined会引起初始值变化
				if (name !== used.value) {
					// reset value
					field?.setValue(undefined);
				}
			}
			if (name === used.value) {
				return;
			}

			let fieldValue;

			const usedSetter = setters.find((item) => item.name === usedName);
			// 获取该setter的返回值类型
			const usedValueType = usedSetter?.valueType || ['string'];

			const setter = setters.find((item) => item.name === name);

			const valueType = setter?.valueType || ['string'];

			usedValueType.map((usedItem) => {
				valueType.map((item) => {
					if (item === usedItem) {
						fieldValue = field?.getValue();
					}
					return item;
				});
				return usedItem;
			});

			syncSelectSetter(name);

			if (setter) {
				handleInitial(setter, fieldValue);
			}
		}

		function syncSelectSetter(name: string) {
			const { field } = props;
			used.value = name;
			setMixedSelect(field, name);
		}

		const getCurrentSetter = computed(() => {
			const { field } = props;
			let firstMatched: SetterItem | undefined;
			let firstDefault: SetterItem | undefined;
			for (const setter of setters) {
				if (setter.name === used.value) {
					return setter;
				}
				if (!setter.condition) {
					if (!firstDefault) {
						firstDefault = setter;
					}
					continue;
				}
				if (!firstMatched && setter.condition(field as any)) {
					firstMatched = setter;
				}
			}
			return firstMatched || firstDefault || setters[0];
		});

		const hasVariableSetter = setters.some(
			(item) => item.name === 'VariableSetter'
		);

		function handleInitial({ initialValue }: SetterItem, fieldValue?: string) {
			const { field, onChange } = props;
			let newValue: any = initialValue;
			if (newValue && typeof newValue === 'function') {
				newValue = newValue(field);
			} else if (fieldValue) {
				newValue = fieldValue;
			}
			onChange && onChange(newValue);
		}

		function renderCurrentSetter(
			currentSetter?: SetterItem,
			extraProps?: object
		) {
			const { className, setters, field, ...restProps } = props;
			className;
			setters;
			if (!currentSetter) {
				if (restProps.value == null) {
					return <span>NullValue</span>;
				}
				return <span>InvalidValue</span>;
			}
			const { setter, props: rawProps } = currentSetter;

			let setterProps: any = {};
			let setterType: any;
			let dynamicProps: any = {};
			if (isDynamicSetter(setter)) {
				setterType = setter.call(field, field as any);
				if (
					typeof setterType === 'object' &&
					typeof setterType.componentName === 'string'
				) {
					dynamicProps = setterType.props || {};
					setterType = setterType.componentName;
				}
			} else {
				setterType = setter;
			}
			if (rawProps) {
				setterProps = rawProps;
				if (typeof setterProps === 'function') {
					setterProps = setterProps(field);
				}
			}

			return createSetterContent(setterType, {
				fromMixedSetterSelect: fromMixedSetterSelect.value,
				...shallowIntl(setterProps),
				field,
				...restProps,
				...extraProps,
				...dynamicProps,
				onInitial: () => {
					handleInitial(currentSetter);
				},
			});
		}

		function contentsFromPolyfill(setterComponent: VariableSetter) {
			const { field } = props;
			const n = setters.length;

			let setterContent: any;
			let actions: any;

			if (n < 3) {
				// 小于3个
				const tipContent = field?.isUseVariable()
					? intlNode('Binded: {expr}', { expr: field.getValue()?.value })
					: intlNode('Variable Binding');
				if (n === 1) {
					setterContent = (
						<a
							onClick={(e: any) => {
								setterComponent.show({ prop: field, node: e.target });
							}}
						>
							{tipContent}
						</a>
					);
				} else {
					// =2: 另外一个 Setter 原地展示，icon 高亮，点击弹出调用 VariableSetter.show
					const otherSetter = setters.find(
						(item) => item.name !== 'VariableSetter'
					)!;
					setterContent = renderCurrentSetter(otherSetter, {
						value: field?.getMockOrValue(),
					});
				}
				actions = (
					<Title
						title={{
							icon: <VariableIcon />,
							tip: tipContent,
						}}
						onClick={(e: any) => {
							setterComponent.show({ prop: field, node: e.target.parentNode });
						}}
						className={field?.isUseVariable() ? 'variable-binded' : ''}
					></Title>
				);
			} else {
				// >=3: 原地展示当前 setter<当前绑定的值，点击调用 VariableSetter.show>，icon tip 提示绑定的值，点击展示切换 Setter，点击其它 setter 直接切换，点击 Variable Setter-> VariableSetter.show
				const currentSetter =
					!used.value && field?.isUseVariable()
						? setters.find((item) => item.name === 'VariableSetter')
						: getCurrentSetter.value;

				if (currentSetter?.name === 'VariableSetter') {
					setterContent = (
						<a
							onClick={(e: any) => {
								setterComponent.show({ prop: field, node: e.target });
							}}
						>
							{intlNode('Binded: {expr}', {
								expr: field?.getValue()?.value ?? '-',
							})}
						</a>
					);
				} else {
					setterContent = renderCurrentSetter(currentSetter);
				}
				actions = renderSwitchAction(currentSetter);
			}

			return {
				setterContent,
				actions,
			};
		}

		function renderSwitchAction(currentSetter?: SetterItem) {
			const usedName = currentSetter?.name || used.value;
			const triggerNode = (
				<div ref={triggerNodeRef}>
					<Title
						title={{
							tip: intlNode('Switch Setter'),
							icon: <ConvertIcon />,
						}}
						className="mtc-switch-trigger"
					/>
				</div>
			);

			return (
				<Dropdown trigger="click">
					{{
						default: () => triggerNode,
						overlay: () => (
							<Menu>
								{setters
									.filter((setter) => setter.list || setter.name === usedName)
									.map((setter) => (
										<Menu.Item
											key={setter.name}
											onClick={() => {
												useSetter(setter.name, usedName);
											}}
										>
											<Title title={setter.title}></Title>
											{setter.name === usedName ? (
												<YesIcon style="color: #5584ff;" />
											) : null}
										</Menu.Item>
									))}
							</Menu>
						),
					}}
				</Dropdown>
			);
		}

		return () => {
			const { className } = props;
			let contents;

			if (hasVariableSetter) {
				// 有变量设置器
				const setterComponent = getSetter('VariableSetter')?.component as any;
				if (setterComponent && setterComponent.isPopup) {
					contents = contentsFromPolyfill(setterComponent);
				}
			} else {
				if (!contents) {
					const currentSetter = getCurrentSetter.value;
					contents = {
						setterContent: renderCurrentSetter(currentSetter),
						actions: renderSwitchAction(currentSetter),
					};
				}
			}

			return (
				<div ref={shell} class={['mtc-setter-mixed', className]}>
					{contents?.setterContent}
					<div class="mtc-setter-actions">{contents?.actions}</div>
				</div>
			);
		};
	},
});
