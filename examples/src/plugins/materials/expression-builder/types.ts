import { PropertySelectorValue } from '../property-selector/types';

export interface HqlSyntaxTree {
	id?: string | number;

	parentId?: string | number;

	/**
	 * 单个条件或条件组
	 */
	type?: 'single' | 'group';

	/**
	 * 逻辑关系
	 */
	logicOperator?: 'AND' | 'OR';

	/**
	 * 子项
	 */
	children?: HqlSyntaxTree[];

	/**
	 * 值
	 */
	params?: PropertySelectorValue & {
		// 条件表达式设置的值
		value?: any;
		// 是否取反
		not?: boolean;
		// 逻辑符号
		logicalSymbol?: string;
	};
}

export interface OrdinalParams {
	type?: string;
	value?: number;
}
