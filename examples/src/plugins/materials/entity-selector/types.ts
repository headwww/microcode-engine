/**
 * 数据配置
 * 配置实体选择器的请求地址和condition条件
 */
import { VxeColumnProps } from 'vxe-table';
import { ExtractPropTypes, PropType } from 'vue';
import { PropertySelectorValue } from '../property-selector/types';

export const entitySelectorProps = {
	params: {
		type: Object as PropType<any>,
	},
	// mode: 'default' 在Input下面有一个table 多选模式
	// mode: 'popover' 点击input后有一个table弹出 单选模式
	// 选择 方式popover是单选还是 default是多选
	mode: {
		type: String as PropType<'default' | 'popover'>,
		default: 'default',
	},

	height: {
		type: [Number, String],
		default: 280,
	},
	placeholder: {
		type: String,
	},
	columns: {
		type: Array as PropType<ColumnProps[]>,
		default: () => [],
	},
	dataConfig: {
		type: Object as PropType<DataConfig>,
	},
	onClear: {
		type: Function as PropType<() => void>,
		default: () => {},
	},
	onRadioChange: {
		type: Function as PropType<(entity: any) => void>,
	},
	// 实体选择器绑定的字段
	path: String,

	// 选中的实体
	value: null,

	inputValue: null,

	// 关联查询
	relationFunc: {
		type: Function as PropType<(params: any) => string>,
	},
};

export type EntitySelectorProps = ExtractPropTypes<typeof entitySelectorProps>;

export interface DataConfig {
	// 请求地址
	url?: string;
	// 请求方法
	method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
	// 目标类
	targetClass?: string;
	// 是否分页
	pagination?: boolean;
	// 需要查询的字段
	queryPath?: string[];

	expressionAndOrdinalParams?: {
		// 表达式树
		syntaxTree?: any;
		// 表达式和参数
		hql?: {
			expression?: string;
			ordinalParams?: OrdinalParams[];
		};
	};
	// 关联查询
	relationFunc?: (params: any) => string;
}

export interface OrdinalParams {
	type?: string;
	value?: number;
}

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
