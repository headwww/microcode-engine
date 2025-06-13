import { Input, Popover } from 'ant-design-vue';
import { get, omit } from 'lodash';
import {
	computed,
	CSSProperties,
	defineComponent,
	nextTick,
	PropType,
	ref,
	watch,
} from 'vue';
import {
	VxeColumnProps,
	VxeGrid,
	VxeGridInstance,
	VxeGridProps,
} from 'vxe-table';
import { clone } from 'xe-utils';
import { PropertySelectorValue } from '../property-selector/types';
import { useCellFormat, useCellRender } from '../table/render';

export interface ColumnProps extends VxeColumnProps {
	/**
	 * 属性配置
	 */
	property?: PropertySelectorValue;

	/**
	 * 是否作为筛选条件，默认作为查询条件
	 */
	filterable?: boolean;

	/**
	 * 数据类型 渲染非编辑状态时显示的样式
	 * text-文本 link-链接 number-数字 boolean-布尔 date-日期 time-时间 enum-枚举 entity-实体 code-条码-二维码
	 */
	dataType?: 'text' | 'number' | 'boolean' | 'date' | 'time' | 'enum';

	/**
	 * 当dataType为date时，格式化
	 */
	dateFormatter?: string;

	/**
	 * 当dataType为time时，格式化
	 */
	timeFormatter?: string;

	/**
	 * 当dataType为number时，保留几位小数
	 */
	digits?: number;

	/**
	 * 当dataType为boolean时，true和false对应的显示的文本
	 */

	boolOptions?: Array<Options>;

	/**
	 * 当dataType为enum时，枚举对应的显示的文本
	 */
	enumOptions?: Array<Options>;

	/**
	 * 提示内容
	 */
	tipContent?: string;
}

/**
 *选项
 */
interface Options {
	// 文本
	label: string;
	// 值
	value: string;
	// 颜色
	color?: string;
}

// 给table编辑使用的
export default defineComponent({
	name: 'LtEntitySelect',
	inheritAttrs: false,
	emits: ['update:value'],
	props: {
		inputValue: null,
		placeholder: {
			type: String,
		},
		// 实体选择器绑定的字段
		path: String,
		onCurrentRowChange: {
			type: Function as PropType<(row?: any, table?: any) => void>,
		},
		onClear: {
			type: Function as PropType<() => void>,
		},
		data: null,
		columns: {
			type: Array as PropType<ColumnProps[]>,
			default: () => [],
		},
		style: Object as PropType<CSSProperties>,
		value: Object as PropType<any>,
	},
	setup(props, { emit }) {
		const tableRef = ref<VxeGridInstance>();

		const open = ref(false);

		const inputValue = ref(props.inputValue);

		const inputRef = ref<any>(); // 新增 inputRef

		const value = computed({
			get() {
				return props.value;
			},
			set(value) {
				emit('update:value', value);
			},
		});

		watch(
			() => props.value,
			(v) => {
				inputValue.value = props.path && get(v, props.path);
			}
		);

		const columns = computed(() => {
			const { columns } = props;
			const cols = [];
			cols.push({
				type: 'seq',
				title: '序号',
				width: 50,
				fixed: 'left',
				align: 'center',
			});

			// 字段列
			const fields =
				columns?.filter(Boolean).map((item) => {
					const { tipContent } = item;
					const { cellRender } = useCellRender(item);
					const { formatter } = useCellFormat(item);
					const column = {
						field: item.property?.fieldName,
						...omit(item, [
							'property',
							'dataType',
							'editType',
							'dateFormatter',
							'timeFormatter',
							'digits',
							'boolOptions',
							'enumOptions',
							'codeType',
							'tipContent',
						]),
						cellRender,
						titleSuffix: tipContent
							? {
									content: tipContent,
								}
							: null,
						params: {
							// TODO 格式化暂时先当作额外参数来设置，直接在formatter中设置会有问题
							formatter,
						},
					};
					return column as any;
				}) || [];

			cols.push(...fields);

			return cols;
		});

		const renderTable = () => {
			const basicProps: VxeGridProps = {
				height: 280,
				size: 'mini',
				round: true,
				border: true,
				stripe: true,
				showOverflow: true,
				showHeaderOverflow: true,
				showFooterOverflow: true,
				columnConfig: {
					resizable: true,
				},
				virtualYConfig: {
					enabled: true,
					gt: 0,
				},
				virtualXConfig: {
					enabled: true,
					gt: 0,
				},
				rowConfig: {
					isCurrent: true,
					isHover: true,
				},
			};

			return (
				<VxeGrid
					{...basicProps}
					ref={tableRef}
					columns={columns.value}
					data={list.value}
					onCurrentRowChange={(v) => {
						open.value = false;
						inputValue.value = props.path && get(v.row, props.path);
						value.value = v.row;
						props.onCurrentRowChange?.(v.row, v);
					}}
				/>
			);
		};
		const list = ref(props.data);

		watch(
			() => props.data,
			(v) => {
				list.value = v;
			},
			{
				deep: true,
			}
		);

		const inputWidth = ref<string>('auto');

		watch(
			inputRef,
			(el) => {
				if (el) {
					nextTick(() => {
						inputWidth.value = `${el.$el.offsetWidth}px`;
					});
				}
			},
			{ immediate: true }
		);

		const onSearch = () => {
			const filterVal = String(inputValue.value).trim().toLowerCase();
			if (filterVal) {
				const filterRE = new RegExp(filterVal, 'gi');
				const searchProps = props.columns.map(
					(item) => item.property?.fieldName
				);
				const rest = props.data?.filter((item: any) =>
					searchProps.some(
						(key: any) =>
							String(item[key]).toLowerCase().indexOf(filterVal) > -1
					)
				);

				list.value = rest?.map((row: any) => {
					const item: any = clone(row);
					searchProps.forEach((key: any) => {
						item[key] = String(item[key]).replace(filterRE, (match) => match);
					});
					return item;
				});
			} else {
				list.value = props.data;
			}
		};

		return () => (
			<Popover
				v-model:open={open.value}
				trigger="click"
				arrow={false}
				overlayStyle={{
					width: inputWidth.value,
					height: '325px',
					zIndex: 1010,
				}}
				placement="bottomLeft"
				overlayInnerStyle={{ padding: '0px' }}
				content={renderTable()}
				onOpenChange={(v) => {
					if (!v) {
						inputValue.value = props.path && get(value.value, props.path);
					}
				}}
			>
				<Input
					ref={inputRef}
					v-model:value={inputValue.value}
					style={props.style}
					onChange={(e) => {
						if (e.type === 'click') {
							value.value = undefined;
							props.onClear?.();
							return;
						}
						onSearch();
					}}
					placeholder={props.placeholder}
					allowClear
				/>
			</Popover>
		);
	},
});
