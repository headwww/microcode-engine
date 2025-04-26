/**
 * 数据配置
 * 配置实体选择器的请求地址和condition条件
 */
import { VxeColumnProps } from 'vxe-table';

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

	// HQL查询条件配置
	queryCondition?: {
		// HQL查询表达式
		expression: string;
		// ，表达式中的参数配置 例如 expression: "this.name = ? and this.code = ?" 对应的 ordinalParams: [{type: "date", value: "18272731882"},{type: "date", value: "18272731882"}],问号和类型需要匹配，目前只是作为日期的匹配
		ordinalParams?: OrdinalParams[];
	};
}

export interface OrdinalParams {
	type?: string;
	value?: number;
}

export interface ColumnProps extends VxeColumnProps {
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
