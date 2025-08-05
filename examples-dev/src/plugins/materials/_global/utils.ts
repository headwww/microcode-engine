import { isArray } from 'lodash-es';
import { VxeUI } from 'vxe-pc-ui';
/**
 * 通用的表格单元格格式化函数
 * @param params 格式化参数
 * @param params.cellValue 单元格值
 * @param params.row 行数据
 * @param params.column 列配置
 * @returns 格式化后的值
 */
export function formatTableCell({
	cellValue,
	row,
	column,
}: {
	cellValue: any;
	row: any;
	column: any;
}) {
	const formatter = column.params?.formatter;
	if (!formatter) return cellValue;

	const isArr = isArray(formatter);
	const gFormatOpts = isArr
		? VxeUI.formats.get(formatter[0])
		: VxeUI.formats.get(formatter);

	const tableCellFormatMethod = gFormatOpts?.tableCellFormatMethod;
	if (!tableCellFormatMethod) return cellValue;

	const extraParams = isArr && formatter.length > 1 ? formatter.slice(1) : [];
	const formatParams = { cellValue, row, column };

	return isArr
		? tableCellFormatMethod(formatParams, ...extraParams)
		: tableCellFormatMethod(formatParams, ...extraParams);
}
