import { VxeColumnProps } from 'vxe-table';

export interface ActionConfig {
	title?: string;
	width?: number;
	buttonType?: string;
	hidden?: boolean;
	maxShowCount?: number;
	fixed?: 'left' | 'right' | 'none';
	actions?: Array<{
		title: string;
		onAction?: () => void;
		onDisabled?: (params: any) => boolean;
	}>;
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
	 * 当dataType为link时，点击链接的回调
	 */
	onLinkClick?: (params: any) => void;

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

/**
 * 行选择器配置
 *
 */
export interface RowSelectorProps {
	title?: string;

	/**
	 * 是否显示行选择器
	 */
	visible?: boolean;

	/**
	 * 选择器类型
	 */
	type?: 'checkbox' | 'radio';
	/**
	 * 宽度
	 */
	width?: number;
	/**
	 * 复选框显示的字段名，可以直接显示在复选框中
	 */
	labelField?: string;

	/**
	 * 默认勾选所有，只会在初始化时被触发一次
	 */
	checkAll?: boolean;

	/**
	 * 只有tree表格和type为checkbox时生效，是否严格的遵循父子不互相关联的做法
	 */
	checkStrictly?: boolean;

	/**
	 * 严格模式，当数据为空或全部禁用时，列头的复选框为禁用状态
	 */
	strict?: boolean;
	/**
	 * 是否显示列头
	 */
	showHeader?: boolean;
	/**
	 * 是否允许勾选的方法，该方法，的返回值用来决定这一行的 checkbox 是否可以勾选
	 */
	checkMethod?(params: any): boolean;
	/**
	 * 是否允许勾选的方法，该方法，的返回值用来决定这一行的 checkbox 是否显示
	 */
	visibleMethod?(params: any): boolean;
	/**
	 * 触发方式
	 */
	trigger?: 'default' | 'cell' | 'row' | 'manual' | '' | null;
	/**
	 * 是否高亮勾选行
	 */
	highlight?: boolean;
	/**
	 * 开启复选框范围选择功能，启用后通过鼠标在复选框的列内滑动选中或取消指定行
	 */
	range?: boolean;
}

export interface SeqConfig {
	visible?: boolean;
	title?: string;
	width?: number;
	startIndex?: number;
	seqMethod?: Function;
}
