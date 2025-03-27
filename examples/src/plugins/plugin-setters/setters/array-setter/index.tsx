import {
	IPublicModelSettingField,
	IPublicTypeFieldConfig,
	IPublicTypeSetterConfig,
	IPublicTypeSetterType,
} from '@arvin-shu/microcode-types';
import {
	computed,
	defineComponent,
	onMounted,
	PropType,
	ref,
	toRaw,
	watch,
	Fragment,
	onBeforeUnmount,
} from 'vue';

import './index.scss';
import { Button, Alert } from 'ant-design-vue';
import { createSettingFieldView } from '@arvin-shu/microcode-editor-skeleton';
import { settingFieldSymbol } from '@arvin-shu/microcode-shell';
import { Title } from '@arvin-shu/microcode-editor-core';
import { SortableEvent, VueDraggable } from 'vue-draggable-plus';
import { DeleteIcon } from './icons/delete';
import { MoveIcon } from './icons/move';
/**
 * onItemChange 用于 ArraySetter 的单个 index 下的数据发生变化，
 * 因此 target.path 的数据格式必定为 [propName1, propName2, arrayIndex, key?]。
 *
 * @param target
 * @param value
 */
function onItemChange(
	target: IPublicModelSettingField,
	index: number,
	item: IPublicModelSettingField,
	props: ArraySetterProps
) {
	const targetPath: Array<string | number> = target?.path;
	if (!targetPath || targetPath.length < 2) {
		// eslint-disable-next-line no-console
		console.warn(
			`[ArraySetter] onItemChange 接收的 target.path <${
				targetPath || 'undefined'
			}> 格式非法需为 [propName, arrayIndex, key?]`
		);
		return;
	}
	const { field } = props;
	const { path } = field;
	if (path[0] !== targetPath[0]) {
		// eslint-disable-next-line no-console
		console.warn(
			`[ArraySetter] field.path[0] !== target.path[0] <${path[0]} !== ${targetPath[0]}>`
		);
		return;
	}
	try {
		const fieldValue = field.getValue();
		fieldValue[index] = item.getValue();
		field?.setValue(fieldValue);
	} catch (e) {
		// eslint-disable-next-line no-console
		console.warn('[ArraySetter] extraProps.setValue failed :', e);
	}
}

export const ArraySetter = defineComponent({
	name: 'ArraySetter',
	inheritAttrs: false,
	props: {
		value: null,
		itemSetter: Object as PropType<IPublicTypeSetterType>,
		field: {
			type: Object as PropType<IPublicModelSettingField>,
		},
		mode: String as PropType<'popup' | 'list'>,
		forceInline: Boolean,
		multiValue: Boolean,
		onChange: Function as PropType<(val: any) => void>,
	},
	setup(props) {
		const columns = computed((): IPublicTypeFieldConfig[] => {
			const itemSetter = props.itemSetter as IPublicTypeSetterConfig;
			let col = [];
			if (
				(itemSetter as IPublicTypeSetterConfig)?.componentName ===
				'ObjectSetter'
			) {
				const items: IPublicTypeFieldConfig[] = (itemSetter as any).props
					?.config?.items;
				if (items && Array.isArray(items)) {
					col = items.filter(
						(item) =>
							item.isRequired ||
							item.important ||
							(item.setter as any)?.isRequired
					);
					if (col.length > 4) {
						return col.slice(0, 4);
					}
					return col;
				}
			}
			return [];
		});

		return () => (
			<ListSetter {...props} columns={columns.value.slice(0, 4)}></ListSetter>
		);
	},
});

interface ArraySetterProps {
	value: any[];
	field: IPublicModelSettingField;
	itemSetter?: IPublicTypeSetterType;
	columns?: IPublicTypeFieldConfig[];
	multiValue?: boolean;
	hideDescription?: boolean;
	onChange?: Function;
	extraProps: {
		renderFooter?: (
			options: ArraySetterProps & { onAdd: (val?: {}) => any }
		) => any;
	};
}

export const ListSetter = defineComponent({
	name: 'ListSetter',
	inheritAttrs: false,
	props: {
		value: null,
		field: {
			type: Object as PropType<IPublicModelSettingField>,
		},
		itemSetter: Object as PropType<IPublicTypeSetterType>,
		extraProps: {
			type: Object as PropType<{
				renderFooter?: (
					options: ArraySetterProps & { onAdd: (val?: {}) => any }
				) => any;
			}>,
		},
		multiValue: Boolean,
		columns: Array,
		hideDescription: Boolean,
		onChange: Function as PropType<(val: any) => void>,
	},
	setup(props) {
		const items = ref<any[]>([]);
		const scrollToLast = ref(false);

		watch(
			() => props.value,
			(newValue) => {
				if (!Array.isArray(newValue)) {
					items.value.length = 0;
					return;
				}
				// console.log('watch', newValue.length, newValue);
				const newItems: IPublicModelSettingField[] = [];
				for (let i = 0; i < newValue.length; i++) {
					let item: any = items.value[i];
					// console.log(item, 'item');

					if (!item) {
						item = props.field?.createField({
							name: i.toString(),
							setter: props.itemSetter,
							forceInline: 1,
							type: 'field',
							extraProps: {
								defaultValue: newValue[i],
								setValue: (target: IPublicModelSettingField) => {
									onItemChange(
										target,
										item.key,
										item,
										props as ArraySetterProps
									);
								},
							},
						});
						item.setValue(newValue[i]);
					}
					newItems.push(item);
				}
				items.value = [...newItems];
			},
			{ immediate: true, deep: true }
		);

		const onAdd = (newValue?: { [key: string]: any }) => {
			const values = props.value || [];
			const initialValue = (props.itemSetter as any)?.initialValue;
			const defaultValue =
				newValue ||
				(typeof initialValue === 'function'
					? initialValue(props.field)
					: initialValue);
			values.push(defaultValue);
			scrollToLast.value = true;
			props.onChange?.(values);
		};

		const onRemove = (removed: any) => {
			const values = props.value || [];
			let i = items.value.indexOf(removed);
			// 使用展开运算符创建新数组，确保触发响应式更新
			const newItems = [...items.value];
			newItems.splice(i, 1);
			items.value = newItems;
			values.splice(i, 1);
			const l = items.value.length;
			while (i < l) {
				toRaw(items.value[i]).setKey(i);
				i++;
			}
			toRaw(removed).remove();
			const pureValues = values.map((item: any) =>
				typeof item === 'object' ? { ...item } : item
			);

			props.onChange?.(pureValues);
		};

		onBeforeUnmount(() => {
			items.value.forEach((item) => {
				item.purge();
			});
		});

		const onSort = (event: SortableEvent) => {
			const oldValues = props.value || [];
			const { oldIndex, newIndex } = event;
			// 交换数组中的元素位置
			const element = oldValues[oldIndex!];
			oldValues.splice(oldIndex!, 1);
			oldValues.splice(newIndex!, 0, element);
			items.value.length = 0;
			props.onChange?.(oldValues);
		};

		const renderContent = () => (
			<Fragment>
				{items.value.length > 0 ? (
					<div class="mtc-setter-list-scroll-body">
						<VueDraggable
							modelValue={items.value}
							onUpdate:modelValue={(value: any) => {
								items.value = value;
							}}
							onSort={onSort}
							ghostClass="mtc-setter-list-card-drag"
							animation={150}
							handle=".handle"
							class="mtc-setter-list-card"
						>
							{items.value.map((field, index) => (
								<ArrayItem
									key={field.id}
									field={field}
									scrollIntoView={
										scrollToLast.value && index === items.value.length - 1
									}
									onRemove={() => onRemove(field as any)}
								/>
							))}
						</VueDraggable>
					</div>
				) : (
					<div class="mtc-setter-list-notice">
						{props.multiValue ? (
							<Alert
								message={'当前选择了多个节点，且值不一致，修改会覆盖所有值'}
								showIcon
								type="warning"
							></Alert>
						) : (
							<Alert
								message="暂无内容，请添加数据！"
								showIcon
								type="info"
							></Alert>
						)}
					</div>
				)}
			</Fragment>
		);

		return () => {
			const { extraProps = {} } = props;
			const { renderFooter } = extraProps;

			return (
				<div class="mtc-setter-list mtc-block-setter">
					{!props.hideDescription &&
						props.columns &&
						items.value.length > 0 && (
							<div class="mtc-setter-list-columns">
								{props.columns.map((column: any) => (
									<Title
										key={column?.name}
										title={column?.description || column?.name}
									/>
								))}
							</div>
						)}
					{renderContent()}
					<div class="mtc-setter-list-add">
						{!renderFooter ? (
							<Button onClick={() => onAdd()} type="text">
								添加一项 +
							</Button>
						) : (
							renderFooter({ ...props, onAdd } as any)
						)}
					</div>
				</div>
			);
		};
	},
});

export const ArrayItem = defineComponent({
	name: 'ArrayItem',
	props: {
		field: {
			type: Object as PropType<IPublicModelSettingField>,
			required: true,
		},
		onRemove: {
			type: Function as PropType<() => void>,
			required: true,
		},
		scrollIntoView: {
			type: Boolean,
			default: false,
		},
	},

	setup(props) {
		const shell = ref<HTMLDivElement>();

		onMounted(() => {
			if (props.scrollIntoView && shell.value) {
				setTimeout(() => {
					shell.value?.scrollIntoView({
						behavior: 'smooth',
						block: 'end',
					});
				}, 100);
			}
		});

		return () => (
			<div class="mtc-listitem" ref={shell}>
				<div class="mtc-listitem-body">
					{createSettingFieldView(
						(toRaw(props.field) as any)[settingFieldSymbol] || props.field,
						toRaw(props.field).parent as any
					)}
				</div>
				<div class="mtc-listitem-actions">
					<Button
						size="small"
						type="text"
						icon={<DeleteIcon></DeleteIcon>}
						onClick={props.onRemove}
						class="mtc-listitem-action"
					></Button>
					<Button
						size="small"
						type="link"
						draggable
						icon={<MoveIcon></MoveIcon>}
						class="mtc-listitem-handler handle cursor-move"
					></Button>
				</div>
			</div>
		);
	},
});
