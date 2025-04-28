import { defineComponent, PropType, Fragment, computed } from 'vue';
import {
	Button,
	Checkbox,
	Input,
	Select,
	SelectProps,
	Switch,
} from 'ant-design-vue';
import { findTree, mapTree } from 'xe-utils';
import {
	CloseCircleOutlined,
	DeleteFilled,
	FolderAddOutlined,
	PlusCircleOutlined,
} from '@ant-design/icons-vue';
import { cloneDeep, omit } from 'lodash-es';
import { Expression } from './types';

import PropertySelector from '../property-selector';
import './style.scss';
import InputGroup from './components/input-group';
import InputNumberGroup from './components/input-number-group';
import DatePicker from './components/date-picker';
import DatePickerGroup from './components/date-picker-group';
import { convertExpressionToHQL } from './utils';
/**
 * expression 条件构建器 用于构建 condition的expr
 * 例如：this.name = '张三' and this.age > 18
 */

export default defineComponent({
	name: 'LtExpressionBuilder',
	emits: ['update:value', 'change'],
	props: {
		targetClass: {
			type: String,
		},
		value: {
			type: Array as PropType<Expression[]>,
		},
	},
	setup(props, { emit, expose }) {
		const expressions = computed<Expression[]>({
			get() {
				return props.value || [];
			},
			set(value) {
				emit('update:value', value);
				emit('change', value);
			},
		});

		function isDelete(expr: Expression) {
			if (expressions.value) {
				const find = findTree(
					expressions.value,
					(item) => expr.parentId === item.id
				);
				return find.item.children?.length === 1;
			}
			return true;
		}

		const onDelete = (item: Expression) => {
			expressions.value = removeItemById(expressions.value, item.id);
		};

		function removeItemById(array: any, idToRemove: any) {
			return array.reduce((accumulator: any, item: any) => {
				if (item.type === 'group' && item.children) {
					item.children = removeItemById(item.children, idToRemove);
				}
				if (item.id !== idToRemove) {
					accumulator.push(item);
				}
				return accumulator;
			}, []);
		}

		const onAdd = (expr: Expression, type: 'single' | 'group') => {
			mapTree(expressions.value, (item) => {
				if (item.id === expr.id) {
					if (type === 'group') {
						const id = uniqueId('group');
						item.children?.push({
							id,
							parentId: item.id,
							type,
							logicOperator: 'AND',
							children: [
								{
									id: uniqueId('single'),
									parentId: id,
									type: 'single',
									params: {
										targetClass: props.targetClass || '',
									},
								},
							],
						});
					} else {
						item.children?.push({
							id: uniqueId('single'),
							parentId: item.id,
							type,
							params: {
								targetClass: props.targetClass || '',
							},
						});
					}
				}
				return item;
			});
			expressions.value = [...expressions.value];
		};

		// 通用参数变更处理
		const updateParams = (
			expr: Expression,
			newParams: Partial<typeof expr.params>,
			omitLogicalSymbol = false
		) => {
			const arr = mapTree(cloneDeep(expressions.value), (item) => {
				if (expr.id === item.id) {
					return {
						...item,
						params: {
							...omit(
								item.params,
								'value',
								omitLogicalSymbol ? 'logicalSymbol' : ''
							),
							...newParams,
						},
					};
				}
				return item;
			});
			expressions.value = arr;
		};

		const renderComponent = (expr: Expression) => {
			if (expr.params?.fieldTypeFlag === '2') {
				return (
					<Select
						style={{ minWidth: '80px' }}
						value={expr.params?.value}
						options={expr.params?.enumInfo?.map((item) => ({
							label: item.value,
							value: item.key,
						}))}
						onUpdate:value={(v) => updateParams(expr, { value: v })}
					/>
				);
			}
			if (expr.params?.fieldType === 'java.lang.Boolean') {
				return (
					<Switch
						checked={expr.params?.value}
						onUpdate:checked={(v) => updateParams(expr, { value: v })}
					/>
				);
			}
			if (expr.params?.fieldType === 'java.lang.String') {
				const Comp = expr.params.logicalSymbol === '起止' ? InputGroup : Input;
				return (
					<Comp
						value={expr.params?.value}
						onUpdate:value={(v) => {
							updateParams(expr, { value: v });
						}}
					></Comp>
				);
			}
			if (
				expr.params?.fieldType === 'java.lang.Integer' ||
				expr.params?.fieldType === 'java.lang.Long' ||
				expr.params?.fieldType === 'java.math.BigDecimal'
			) {
				const Comp =
					expr.params.logicalSymbol === '起止' ? InputNumberGroup : Input;
				return (
					<Comp
						value={expr.params?.value}
						onUpdate:value={(v) => {
							updateParams(expr, { value: v });
						}}
					/>
				);
			}
			if (expr.params?.fieldType === 'java.util.Date') {
				if (expr.params.logicalSymbol === '起止') {
					return (
						<DatePickerGroup
							value={expr.params?.value}
							onUpdate:value={(v) => {
								updateParams(expr, { value: v });
							}}
						/>
					);
				}
				if (expr.params.logicalSymbol === '预设') {
					const options = [
						{ label: '当天', value: '当天' },
						{ label: '近两天', value: '近两天' },
						{ label: '近三天', value: '近三天' },
						{ label: '本周', value: '本周' },
						{ label: '一周内', value: '一周内' },
						{ label: '本月', value: '本月' },
						{ label: '一月内', value: '一月内' },
					];
					return (
						<Select
							options={options}
							value={expr.params?.value}
							style={{ width: '150px' }}
							onUpdate:value={(v) => {
								updateParams(expr, { value: v });
							}}
						></Select>
					);
				}

				return (
					<DatePicker
						value={expr.params?.value}
						onUpdate:value={(v) => {
							updateParams(expr, { value: v });
						}}
					/>
				);
			}
			return null;
		};

		const renderItemContent = (expr: Expression) => (
			<div style="display: flex; align-items: center; gap: 12px">
				<PropertySelector
					style={{ minWidth: '108px' }}
					value={expr.params}
					onChange={(v) => updateParams(expr, v, true)}
				/>
				{expr?.params?.fieldName && (
					<Fragment>
						<Select
							placeholder="请选择"
							dropdownStyle={{ minWidth: '100px' }}
							value={expr.params?.logicalSymbol}
							options={getLogicalSymbols(expr.params)}
							onChange={(v) =>
								updateParams(expr, { logicalSymbol: v as string })
							}
						/>
						{renderComponent(expr)}
						<Checkbox
							checked={expr.params?.not}
							onUpdate:checked={(v) => updateParams(expr, { not: v })}
						>
							取反
						</Checkbox>
					</Fragment>
				)}
			</div>
		);

		const renderItem = (item: Expression) => {
			item;
			return (
				<div style="display: flex; align-items: center">
					{renderItemContent(item)}
					<Button
						size="small"
						type="link"
						onClick={() => onDelete(item)}
						disabled={isDelete(item)}
						icon={<DeleteFilled class="lt-expr-delete" />}
					/>
				</div>
			);
		};

		const renderGroup = (expr: Expression) => {
			const logicOperator = expr.logicOperator || 'AND';

			const onChange = (v: any) => {
				const arr = mapTree(cloneDeep(expressions.value), (item) => {
					if (expr.id === item.id) {
						return {
							...item,
							logicOperator: v,
						};
					}
					return item;
				});

				expressions.value = arr;
			};

			return (
				<Fragment>
					<div class="lt-expr-group">
						<div class="lt-expr-item">
							<div class="lt-expr-item-logic">
								<Select
									style="width: 60px"
									value={logicOperator}
									onChange={onChange}
								>
									<Select.Option value={'AND'}>且</Select.Option>
									<Select.Option value={'OR'}>或</Select.Option>
								</Select>
							</div>
							<div class="lt-expr-item-content">
								{expr.children?.map((item) => (
									<div
										class={[
											'lt-expr-item-row',
											item.type === 'group' ? 'is-group' : '',
										]}
									>
										{item.type === 'group'
											? renderGroup(item)
											: renderItem(item)}
									</div>
								))}
							</div>
						</div>
						<div class="lt-expr-actions">
							<Button
								onClick={() => {
									onAdd(expr, 'single');
								}}
								icon={<PlusCircleOutlined />}
								size="small"
								type="text"
							>
								添加条件
							</Button>
							<Button
								onClick={() => {
									onAdd(expr, 'group');
								}}
								icon={<FolderAddOutlined />}
								size="small"
								type="text"
							>
								添加条件组
							</Button>
						</div>
					</div>
					{expr.parentId && (
						<Button
							class="lt-expr-delete-group"
							size="small"
							type="link"
							disabled={isDelete(expr)}
							icon={<CloseCircleOutlined />}
							onClick={() => onDelete(expr)}
						/>
					)}
				</Fragment>
			);
		};

		const getExpressionAndOrdinalParams = () =>
			expressions.value && expressions.value.length > 0
				? convertExpressionToHQL(expressions.value[0])
				: null;

		expose({
			getExpressionAndOrdinalParams,
		});

		return () =>
			expressions.value && expressions.value.length > 0 ? (
				expressions.value?.map((item) =>
					item.type === 'group' ? renderGroup(item) : renderItem(item)
				)
			) : (
				<Button
					onClick={() => {
						const id = uniqueId('group');
						expressions.value = [
							{
								id,
								type: 'group',
								logicOperator: 'AND',
								children: [
									{
										id: uniqueId('single'),
										parentId: id,
										type: 'single',
										params: {
											targetClass: props.targetClass || '',
										},
									},
								],
							},
						];
					}}
					icon={<FolderAddOutlined />}
					size="small"
					type="text"
				>
					创建条件
				</Button>
			);
	},
});

/**
 枚举: 等于 为空
 数字: 等于 小于 小于等于 大于 大于等于 起止 为空
 日期: 等于 小于 小于等于 大于 大于等于 起止 预设 为空
 字符: 等于 开头匹配 末尾匹配 包含 起止 为空
 */
function getLogicalSymbols(params: any): SelectProps['options'] {
	if (
		params.fieldTypeFlag === '2' ||
		params.fieldType === 'java.lang.Boolean'
	) {
		return [
			{ value: '等于', label: '等于' },
			{ value: '为空', label: '为空' },
		];
	}
	if (
		params.fieldType === 'java.lang.Integer' ||
		params.fieldType === 'java.lang.Long' ||
		params.fieldType === 'java.math.BigDecimal'
	) {
		return [
			{ value: '等于', label: '等于' },
			{ value: '小于', label: '小于' },
			{ value: '小于等于', label: '小于等于' },
			{ value: '大于', label: '大于' },
			{ value: '大于等于', label: '大于等于' },
			{ value: '起止', label: '起止' },
			{ value: '为空', label: '为空' },
		];
	}
	if (params.fieldType === 'java.util.Date') {
		return [
			{ value: '等于', label: '等于' },
			{ value: '小于', label: '小于' },
			{ value: '小于等于', label: '小于等于' },
			{ value: '大于', label: '大于' },
			{ value: '大于等于', label: '大于等于' },
			{ value: '起止', label: '起止' },
			{ value: '预设', label: '预设' },
			{ value: '为空', label: '为空' },
		];
	}
	if (params.fieldType === 'java.lang.String') {
		return [
			{ value: '等于', label: '等于' },
			{ value: '开头匹配', label: '开头匹配' },
			{ value: '末尾匹配', label: '末尾匹配' },
			{ value: '包含', label: '包含' },
			{ value: '起止', label: '起止' },
			{ value: '为空', label: '为空' },
		];
	}
}

let guid = Date.now();
function uniqueId(prefix = '') {
	return `${prefix}${(guid++).toString(36).toLowerCase()}`;
}
