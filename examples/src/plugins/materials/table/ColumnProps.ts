import { VxeColumnProps } from 'vxe-table';

export interface ColumnProps extends VxeColumnProps {
	/**
	 * 数据类型 渲染非编辑状态时显示的样式
	 * text-文本 link-链接 number-数字 boolean-布尔 date-日期 time-时间 enum-枚举 entity-实体 code-条码-二维码
	 */
	dataType?:
		| 'text'
		| 'link'
		| 'number'
		| 'boolean'
		| 'date'
		| 'time'
		| 'enum'
		| 'entity'
		| 'code';

	/**
	 * 编辑类型
	 */
	editType?:
		| 'text'
		| 'number'
		| 'boolean'
		| 'select'
		| 'date'
		| 'time'
		| 'disabledEdit'
		| string;

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
	 * 当dataType为code时，使用二维码还是条形码
	 */
	codeType?: 'qrCode' | 'barCode';

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
