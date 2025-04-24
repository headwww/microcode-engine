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
