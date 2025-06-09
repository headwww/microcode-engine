import {
	IPublicModelSettingField,
	IPublicTypeSetterType,
} from '@arvin-shu/microcode-types';
import {
	computed,
	defineComponent,
	onBeforeUnmount,
	PropType,
	ref,
	toRaw,
	watch,
} from 'vue';
import { createSettingFieldView } from '@arvin-shu/microcode-editor-skeleton';
import { settingFieldSymbol } from '@arvin-shu/microcode-shell';
import { SortableEvent, VueDraggable } from 'vue-draggable-plus';

import './index.scss';
import { Alert, Button, Dropdown, Menu } from 'ant-design-vue';
import { clone, cloneDeep, get, pullAt, set } from 'lodash';
import { toTreeArray } from 'xe-utils';
import { DeleteIcon } from './icons/delete';
import { MoveIcon } from './icons/move';
import { AddIcon } from './icons/add';

export interface ITreeArrayItem {
	type: string;
	settingField: IPublicModelSettingField;
	childrenField?: IPublicModelSettingField;
	children?: ITreeArrayItem[];
}

function moveItem(array: any, oldIndex: number, newIndex: number) {
	const newArr = cloneDeep(array);
	const [item] = pullAt(newArr, oldIndex);
	newArr.splice(newIndex, 0, item);
	return newArr;
}

export const TreeArraySetter = defineComponent({
	name: 'TreeArraySetter',
	inheritAttrs: false,
	props: {
		value: Array,
		field: {
			type: Object as PropType<IPublicModelSettingField>,
		},
		groupSetter: {
			type: Object as PropType<IPublicTypeSetterType>,
		},
		childrenSetter: {
			type: Object as PropType<IPublicTypeSetterType>,
		},
		onChange: Function as PropType<(val: any) => void>,
		defaultCollapsed: {
			type: Boolean,
			default: false,
		},
	},
	setup(props) {
		function initFields(field: IPublicModelSettingField, value: Array<any>) {
			return value.map((item, index) => {
				const settingField = field.createField({
					name: index.toString(),
					setter:
						item._DATA_TYPE === 'group'
							? props.groupSetter
							: props.childrenSetter,
					forceInline: 1,
					type: 'field',
					extraProps: {
						defaultValue: item,
					},
				});

				const obj: ITreeArrayItem = {
					type: item._DATA_TYPE,
					settingField,
				};

				if (item._DATA_TYPE === 'group') {
					const childrenField = settingField.createField({
						name: 'children',
						setter: props.groupSetter,
						forceInline: 1,
						type: 'field',
						extraProps: {
							defaultValue: settingField.getPropValue('children'),
						},
					});
					obj.childrenField = childrenField;
					obj.children = initFields(childrenField, item.children || []);
				}

				return obj;
			});
		}

		const fields = ref<any>();

		const data = ref(props.value || []);

		watch(
			() => data.value,
			(newValue) => {
				fields.value = initFields(props.field!, newValue || []);
			},
			{ deep: true, immediate: true }
		);

		onBeforeUnmount(() => {
			toTreeArray(fields.value).forEach((item) => {
				item?.settingField?.purge();
				item?.childrenField?.purge();
			});
		});

		const onAdd = (type: string) => {
			const initialValue =
				type === 'group'
					? (props.groupSetter as any)?.initialValue
					: (props.childrenSetter as any)?.initialValue;
			const defaultValue =
				initialValue ||
				(typeof initialValue === 'function'
					? initialValue(toRaw(props.field!))
					: initialValue);
			data.value.push({
				...defaultValue,
				_DATA_TYPE: type,
			});
			props.onChange?.(data.value);
		};

		// 变更的组集合 如果长度是一则是本集合内拖拽交换，如果长度是2则是主子集拖拽 第一位是新增的组，第二位是移除的组
		const changeGroup = ref<IPublicModelSettingField[]>([]);
		// 添加一个标志来追踪是否正在进行排序
		const isSorting = ref(false);

		return () => (
			<div class="mtc-block-setter mtc-tree-array-setter">
				{props.value && props.value.length !== 0 ? (
					<NestedComponent
						root={true}
						v-model:value={data.value}
						fields={fields.value}
						field={props.field}
						groupField={props.field}
						groupSetter={props.groupSetter}
						childrenSetter={props.childrenSetter}
						onChangeGroup={(field: any) => {
							changeGroup.value.push(field);
						}}
						onSort={(event: SortableEvent) => {
							const { to, from, newIndex = 0, oldIndex = 0 } = event as any;
							if (to === from) {
								// 同级拖拽
								if (changeGroup.value.length === 1) {
									const propsValue = cloneDeep(props.field?.getValue()) || [];
									const path = clone(toRaw(changeGroup.value[0]).path);
									path.shift();
									let newArr = [];
									if (path.length > 0) {
										newArr = moveItem(
											get(propsValue, path),
											oldIndex,
											newIndex
										);
										set(propsValue, path, newArr);
										data.value = [...propsValue];
									} else {
										newArr = moveItem(props.value, oldIndex, newIndex);
										data.value = [...newArr];
									}
									props.onChange?.(data.value);
								}
							} else {
								// 在你的组件代码中
								if (changeGroup.value.length === 2 && !isSorting.value) {
									isSorting.value = true;
									// 第一位是新增的组，第二位是移除的组
									const arr = cloneDeep(props.field?.getValue()) || [];

									// 获取新增的位置
									const newPath = clone(toRaw(changeGroup.value[0]).path);
									// 获取移除的位置
									const oldPath = clone(toRaw(changeGroup.value[1]).path);

									newPath.shift();
									oldPath.shift();
									console.log('====');

									// 如果新增的位置长度小于移除的位置，则是从子往父拖拽，先处理移除再处理新增
									if (newPath.length < oldPath.length) {
										// 先从原位置获取要移动的项
										const clonedData =
											oldPath.length > 0
												? get(arr, oldPath.join('.'))[oldIndex]
												: arr[oldIndex];
										// 从原位置删除
										if (oldPath.length > 0) {
											const oldArr = get(arr, oldPath.join('.'));
											oldArr.splice(oldIndex, 1);
											set(arr, oldPath.join('.'), oldArr);
										} else {
											arr.splice(oldIndex, 1);
										}
										// 在新位置插入
										if (newPath.length > 0) {
											const newArr = get(arr, newPath.join('.'));
											newArr.splice(newIndex, 0, clonedData);
											set(arr, newPath.join('.'), newArr);
										} else {
											arr.splice(newIndex, 0, clonedData);
										}
									} else {
										// 反之是父往子拖拽，先处理新增再处理移除
										// 在新位置插入
										const clonedData =
											oldPath.length > 0
												? get(arr, oldPath.join('.'))[oldIndex]
												: arr[oldIndex];
										if (newPath.length > 0) {
											const newArr = get(arr, newPath.join('.'));
											newArr.splice(newIndex, 0, clonedData);
											set(arr, newPath.join('.'), newArr);
										} else {
											arr.splice(newIndex, 0, clonedData);
										}
										// 从原位置删除
										if (oldPath.length > 0) {
											const oldArr = get(arr, oldPath.join('.'));
											oldArr.splice(oldIndex, 1);
											set(arr, oldPath.join('.'), oldArr);
										} else {
											arr.splice(oldIndex, 1);
										}
									}

									data.value = [...arr];
									props.onChange?.(data.value);
								}
							}

							setTimeout(() => {
								isSorting.value = false;
							}, 0);
						}}
						onStart={() => {
							changeGroup.value.length = 0;
						}}
						onDelete={() => {
							props.onChange?.(data.value);
						}}
						onAdd={() => {
							props.onChange?.(data.value);
						}}
					/>
				) : (
					<Alert message="暂无内容，请添加数据！" showIcon type="info" />
				)}
				<Dropdown>
					{{
						default: () => (
							<Button class="mtc-tree-array-setter-add" type="text">
								添加一项 +
							</Button>
						),
						overlay: () => (
							<Menu>
								<Menu.Item
									onClick={() => {
										onAdd('children');
									}}
								>
									添加子节点
								</Menu.Item>
								<Menu.Item
									onClick={() => {
										onAdd('group');
									}}
								>
									添加组
								</Menu.Item>
							</Menu>
						),
					}}
				</Dropdown>
			</div>
		);
	},
});

const NestedComponent = defineComponent({
	name: 'NestedComponent',
	emits: ['update:value'],
	props: {
		value: Array as PropType<any[]>,
		fields: Array as PropType<ITreeArrayItem[]>,
		rootField: Object as PropType<IPublicModelSettingField>,
		groupField: Object as PropType<IPublicModelSettingField>,
		groupSetter: {
			type: Object as PropType<IPublicTypeSetterType>,
		},
		childrenSetter: {
			type: Object as PropType<IPublicTypeSetterType>,
		},
		onSort: Function as PropType<(event: SortableEvent) => void>,
		root: Boolean,
		onDelete: Function as PropType<() => void>,
		onAdd: Function as PropType<() => void>,
		onStart: Function as PropType<(event: SortableEvent) => void>,
		onEnd: Function as PropType<(event: SortableEvent) => void>,
		onChangeGroup: Function as PropType<
			(formField?: IPublicModelSettingField) => void
		>,
	},

	setup(props, { emit }) {
		const list = computed({
			get() {
				return props.value || [];
			},
			set(val: any) {
				props.onChangeGroup?.(props.groupField);
				emit('update:value', val);
			},
		});

		function onAdd(
			field: IPublicModelSettingField,
			index: number,
			type: string
		) {
			const oldValue = cloneDeep(list.value);
			const initialValue =
				type === 'group'
					? (props.groupSetter as any)?.initialValue
					: (props.childrenSetter as any)?.initialValue;
			const defaultValue =
				initialValue ||
				(typeof initialValue === 'function'
					? initialValue(field)
					: initialValue);

			list.value[index].children = [
				...(oldValue[index].children || []),
				{
					...defaultValue,
					_DATA_TYPE: type,
				},
			];
			props.onAdd?.();
		}

		return () => (
			<VueDraggable
				modelValue={list.value}
				onUpdate:modelValue={(val: any) => {
					list.value = val;
				}}
				class={['mtc-tree-array-group', { 'is-root': props.root }]}
				onSort={(event: SortableEvent) => {
					props.onSort?.(event);
				}}
				onEnd={(event: SortableEvent) => {
					props.onEnd?.(event);
				}}
				group="g1"
				handle=".handle"
				animation={150}
				onStart={props.onStart}
			>
				{props.value?.map((item: any, index: number) => {
					const obj: any = toRaw(props.fields?.[index]);

					return (
						<div key={index} class={'mtc-tree-array-item'}>
							<div class={'mtc-tree-array-item-body'}>
								<div class={'mtc-tree-array-item-body-content'}>
									{item.name}
									{createSettingFieldView(
										obj?.settingField[settingFieldSymbol],
										obj?.settingField.parent
									)}
								</div>
								<div class="mtc-actions">
									{item._DATA_TYPE === 'group' ? (
										<Dropdown>
											{{
												default: () => (
													<Button
														size="small"
														type="text"
														icon={<AddIcon></AddIcon>}
													></Button>
												),
												overlay: () => (
													<Menu>
														<Menu.Item
															onClick={() => {
																onAdd(obj.settingField, index, 'children');
															}}
														>
															添加子节点
														</Menu.Item>
														<Menu.Item
															onClick={() => {
																onAdd(obj.settingField, index, 'group');
															}}
														>
															添加组
														</Menu.Item>
													</Menu>
												),
											}}
										</Dropdown>
									) : (
										<div style="width: 24px;"></div>
									)}
									<Button
										size="small"
										type="text"
										onClick={() => {
											const newList = cloneDeep(list.value);
											newList.splice(index, 1);
											list.value = [...newList];
											obj.settingField.remove();
											props.onDelete?.();
										}}
										icon={<DeleteIcon></DeleteIcon>}
									/>
									<Button
										class={['handle', 'cursor-move']}
										size="small"
										type="link"
										icon={<MoveIcon />}
									></Button>
								</div>
							</div>

							{item._DATA_TYPE === 'group' && (
								<NestedComponent
									v-model:value={item.children}
									fields={obj?.children}
									groupField={obj?.childrenField}
									onSort={props.onSort}
									onEnd={props.onEnd}
									onStart={props.onStart}
									onDelete={props.onDelete}
									onAdd={props.onAdd}
									onChangeGroup={props.onChangeGroup}
								/>
							)}
						</div>
					);
				})}
			</VueDraggable>
		);
	},
});
