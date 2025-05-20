import { VxeUI } from 'vxe-pc-ui';

VxeUI.menus.mixin({
	/**
	 * 隐藏列
	 */
	HIDDEN_COLUMN: {
		menuMethod(params) {
			const { $table, column } = params;
			if (column) {
				$table.hideColumn(column);
			}
		},
	},
	/**
	 * 重置列的可视状态
	 */
	RESET_COLUMN: {
		menuMethod(params) {
			const { $table } = params;
			$table.resetCustom({ visible: true });
		},
	},

	/**
	 * 清除所选列排序条件
	 */
	CLEAR_SORT: {
		menuMethod(params) {
			const { $event, $table, column } = params as any;
			if (column) {
				$table.triggerSortEvent($event, column, null);
			}
		},
	},
	/**
	 * 清除所有排序条件
	 */
	CLEAR_ALL_SORT: {
		menuMethod(params) {
			const { $event, $table } = params;
			const sortList = $table.getSortColumns();
			if (sortList.length) {
				$table.clearSort();
				$table.dispatchEvent('clear-sort', { sortList }, $event);
			}
		},
	},
	RESET_FILTER: {
		menuMethod(params) {
			const { $table } = params;
			$table.clearFilter();
		},
	},
	/**
	 * 还原所有数据的值
	 */
	REVERT_ALL: {
		menuMethod(params) {
			const { $table } = params;
			$table.revertData();
		},
	},
});
