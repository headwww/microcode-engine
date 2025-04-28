import { PropertySelectorValue } from '../property-selector/types';

export interface Expression {
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
	children?: Expression[];

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

	/**
	 * 额外的参数
	 */
	expr?: { [key: string]: any };
}

export interface HQL {
	// HQL查询表达式
	expression?: string;
	// ，表达式中的参数配置 例如 expression: "this.name = ? and this.code = ?" 对应的 ordinalParams: [{type: "date", value: "18272731882"},{type: "date", value: "18272731882"}],问号和类型需要匹配，目前只是作为日期的匹配
	ordinalParams?: OrdinalParams[];
}

export interface OrdinalParams {
	type?: string;
	value?: number;
}
