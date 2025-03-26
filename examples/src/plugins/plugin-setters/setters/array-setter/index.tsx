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
} from 'vue';

import './index.scss';
import { Button, Alert } from 'ant-design-vue';
import { createSettingFieldView } from '@arvin-shu/microcode-editor-skeleton';
import { settingFieldSymbol } from '@arvin-shu/microcode-shell';
import { Title } from '@arvin-shu/microcode-editor-core';
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
		value: {
			type: Array as PropType<any[]>,
		},
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
				if (!Array.isArray(newValue)) return;
				const newItems: IPublicModelSettingField[] = [];
				for (let i = 0; i < newValue.length; i++) {
					let item = items.value[i];
					if (!item) {
						item = props.field?.createField({
							name: i.toString(),
							setter: props.itemSetter,
							forceInline: 1,
							type: 'field',
							extraProps: {
								defaultValue: newValue[i],
								setValue: (target: IPublicModelSettingField) => {
									onItemChange(target, i, item as any, props as any);
								},
							},
						}) as any;
						item.setValue(newValue[i]);
					}
					newItems.push(toRaw(item) as any);
				}
				items.value = newItems;
			},
			{ immediate: true }
		);

		const onAdd = (newValue?: { [key: string]: any }) => {
			const values = [...(props.value || [])];
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

		const onRemove = (removed: IPublicModelSettingField) => {
			const values = [...(props.value || [])];
			const currentItems = [...items.value];

			// 找到要删除项的索引
			const index = currentItems.indexOf(removed);
			if (index === -1) return;

			// 从数组中移除该项
			currentItems.splice(index, 1);
			values.splice(index, 1);

			// 更新剩余项的键值
			for (let i = index; i < currentItems.length; i++) {
				toRaw(currentItems[i]).setKey(i);
			}

			// 清理被删除的字段
			toRaw(removed).remove();

			// 处理值，确保对象类型的值被正确复制
			const pureValues = values.map((item: any) =>
				typeof item === 'object' ? { ...item } : item
			);

			// 更新状态
			items.value = currentItems;
			props.onChange?.(pureValues);
		};

		const renderContent = () => (
			<Fragment>
				{items.value.length > 0 ? (
					<div class="mtc-setter-list-scroll-body">
						<div class="mtc-setter-list-card">
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
						</div>
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
										title={column?.title || column?.name}
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
						type="text"
						draggable
						icon={<MoveIcon></MoveIcon>}
						class="mtc-listitem-handler"
					></Button>
				</div>
			</div>
		);
	},
});
