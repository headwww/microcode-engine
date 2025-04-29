import { isArray } from 'lodash-es';
import dayjs from 'dayjs';
import { HqlSyntaxTree, OrdinalParams } from './types';

/**
 * 将Expression转换为HQL
 *
 * @param expr 表达式
 * @returns HQL
 */
export function convertSyntaxTreeToHQL(expr?: HqlSyntaxTree): {
	expression: string;
	ordinalParams?: OrdinalParams[];
} {
	if (!expr) return { expression: '' };

	// group 类型
	if (expr.type === 'group' && Array.isArray(expr.children)) {
		const logic = expr.logicOperator?.toUpperCase() === 'OR' ? 'OR' : 'AND';
		const childResults = expr.children
			.map((child) => convertSyntaxTreeToHQL(child))
			.filter((res) => res.expression && res.expression.trim().length > 0);

		// 拼接所有子表达式
		const expression =
			childResults.length > 0
				? `(${childResults.map((res) => res.expression).join(` ${logic} `)})`
				: '';

		// 合并所有参数
		const ordinalParams = childResults.flatMap(
			(res) => res.ordinalParams || []
		);

		return { expression, ordinalParams };
	}

	// single 类型
	if (expr.type === 'single') {
		const { expression, ordinalParams } = buildSingleHQL(expr);
		return { expression, ordinalParams };
	}

	return { expression: '' };
}

function buildSingleHQL(expr: HqlSyntaxTree) {
	if (!expr.params) {
		return {
			expression: '',
		};
	}

	const { fieldName, fieldType, value: v, logicalSymbol, not } = expr.params;

	let value: any = '';

	if (isArray(v)) {
		if (
			fieldType === 'java.lang.Boolean' ||
			fieldType === 'java.lang.Integer' ||
			fieldType === 'java.lang.Long' ||
			fieldType === 'java.math.BigDecimal' ||
			fieldType === 'java.util.Date'
		) {
			value = v.map((item) => item);
		} else {
			value = v.map((item) => `'${item}'`);
		}
	} else {
		if (
			fieldType === 'java.lang.Boolean' ||
			fieldType === 'java.lang.Integer' ||
			fieldType === 'java.lang.Long' ||
			fieldType === 'java.math.BigDecimal' ||
			fieldType === 'java.util.Date'
		) {
			value = v;
		} else {
			value = `'${v}'`;
		}
	}

	let expression = '';
	let ordinalParams: OrdinalParams[] = [];

	switch (logicalSymbol) {
		case '等于':
			if (fieldType === 'java.util.Date') {
				expression = `this.${fieldName} = ?`;
				ordinalParams = [
					{
						type: 'Date',
						value,
					},
				];
			} else {
				expression = `this.${fieldName} = ${value}`;
			}
			break;
		case '小于':
			if (fieldType === 'java.util.Date') {
				expression = `this.${fieldName} < ?`;
				ordinalParams = [
					{
						type: 'Date',
						value,
					},
				];
			} else {
				expression = `this.${fieldName} < ${value}`;
			}
			break;
		case '小于等于':
			if (fieldType === 'java.util.Date') {
				expression = `this.${fieldName} <= ?`;
				ordinalParams = [
					{
						type: 'Date',
						value,
					},
				];
			} else {
				expression = `this.${fieldName} <= ${value}`;
			}
			break;
		case '大于':
			if (fieldType === 'java.util.Date') {
				expression = `this.${fieldName} > ?`;
				ordinalParams = [
					{
						type: 'Date',
						value,
					},
				];
			} else {
				expression = `this.${fieldName} > ${value}`;
			}
			break;
		case '大于等于':
			if (fieldType === 'java.util.Date') {
				expression = `this.${fieldName} >= ?`;
				ordinalParams = [
					{
						type: 'Date',
						value,
					},
				];
			} else {
				expression = `this.${fieldName} >= ${value}`;
			}
			break;
		case '起止':
			if (isArray(value) && value.length === 2) {
				if (fieldType === 'java.util.Date') {
					expression = `this.${fieldName} BETWEEN ? AND ?`;
					ordinalParams = [
						{
							type: 'Date',
							value: value[0],
						},
						{
							type: 'Date',
							value: value[1],
						},
					];
				} else {
					expression = `this.${fieldName} BETWEEN ${value[0]} AND ${value[1]}`;
				}
			}
			break;
		case '预设':
			if (fieldType === 'java.util.Date') {
				let start: number = 0;
				let end: number = 0;
				const now = dayjs();

				if (value === '当天') {
					start = now.startOf('day').valueOf();
					end = now.endOf('day').valueOf();
				}
				if (value === '近两天') {
					start = now.subtract(1, 'day').startOf('day').valueOf();
					end = now.endOf('day').valueOf();
				}
				if (value === '近三天') {
					start = now.subtract(2, 'day').startOf('day').valueOf();
					end = now.endOf('day').valueOf();
				}
				if (value === '本周') {
					start = now.startOf('week').valueOf();
					end = now.endOf('week').valueOf();
				}
				if (value === '一周内') {
					start = now.subtract(6, 'day').startOf('day').valueOf();
					end = now.endOf('day').valueOf();
				}
				if (value === '本月') {
					start = now.startOf('month').valueOf();
					end = now.endOf('month').valueOf();
				}
				if (value === '一月内') {
					start = now.subtract(29, 'day').startOf('day').valueOf();
					end = now.endOf('day').valueOf();
				}

				if (start !== undefined && end !== undefined) {
					expression = `this.${fieldName} BETWEEN ? AND ?`;
					ordinalParams = [
						{ type: 'Date', value: start },
						{ type: 'Date', value: end },
					];
				}
			}
			break;
		case '开头匹配':
			expression = `this.${fieldName} LIKE '${v}%'`;
			break;
		case '末尾匹配':
			expression = `this.${fieldName} LIKE '%${v}'`;
			break;
		case '包含':
			expression = `this.${fieldName} LIKE '%${v}%'`;
			break;
		case '为空':
			expression = `this.${fieldName} IS NULL`;
			break;
		default:
			expression = `this.${fieldName} ${logicalSymbol} ${value}`;
			break;
	}

	if (not) {
		expression = `NOT (${expression})`;
	}

	return {
		expression,
		ordinalParams,
	};
}
