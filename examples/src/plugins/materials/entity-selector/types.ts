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

	expressionAndOrdinalParams?: {
		// 表达式树
		syntaxTree?: any;
		// 表达式和参数
		hql?: {
			expression?: string;
			ordinalParams?: OrdinalParams[];
		};
	};
}

export interface OrdinalParams {
	type?: string;
	value?: number;
}

export interface ColumnProps extends VxeColumnProps {
	/**
	 * 属性配置
	 */
	property?: {
		// 属性名称
		fieldName?: string;
		// 属性的名称
		fieldCommnet?: string;
		// 属性类型标识 0: 基本类型 1: class实体 2: 枚举实体
		fieldTypeFlag?: string;
		// 属性类型 实体.包名.属性名 例如: lt.fw.core.model.biz.Corp，也可以是java.lang.String
		fieldType?: string;
		// 是否为空
		notNull?: 0 | 1;
		// 枚举信息 { "value": "集团", "key": "HEAD"},
		enumInfo?: {
			// 枚举值
			value: string;
			// 枚举名称
			key: string;
		}[];
	};

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
