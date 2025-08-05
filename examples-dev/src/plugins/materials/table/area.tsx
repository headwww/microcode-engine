import {
	computed,
	CSSProperties,
	nextTick,
	onMounted,
	onUnmounted,
	reactive,
	Ref,
	ref,
	watch,
} from 'vue';
import { VxeGridInstance } from 'vxe-table';

// 类型定义
interface SelectionPosition {
	rowIndex: number;
	cellIndex: number;
	colid: string;
	rowid: string;
}

interface TableStyles {
	body: CSSProperties;
	active: CSSProperties;
	main: CSSProperties;
	copy: CSSProperties;
}

// 全局变量
let activeAreaInstance: any = null;

/**
 * 表格区域选择 Hook
 * @param tableInstance 表格实例引用
 * @returns 区域选择相关方法
 */
export function useArea(
	tableInstance: Ref<(VxeGridInstance & HTMLDivElement) | undefined>
) {
	// 响应式引用
	// 选区框
	const areaRef = ref<HTMLDivElement>();
	// 表格容器（不包括表头，表尾）
	const tableWrapper = ref<HTMLDivElement>();
	// 空提示用于定位区域布局插入的位置
	const emptyBlock = ref<HTMLDivElement | null>();
	// 是否正在进行选择操作,默认为false
	const isSelecting = ref(false);
	// 是否激活选区框,默认为false
	const isActivated = ref(false);

	// 样式对象
	const styles = reactive<TableStyles>({
		body: {},
		active: {},
		main: {},
		copy: {},
	});

	// 选择位置状态
	const selectionStart = reactive<SelectionPosition>({
		rowIndex: -1,
		cellIndex: -1,
		colid: '',
		rowid: '',
	});
	const selectionEnd = reactive<SelectionPosition>({
		rowIndex: -1,
		cellIndex: -1,
		colid: '',
		rowid: '',
	});

	let autoScrollTimer: number | null = null;

	watch(
		() => tableInstance.value?.getData(),
		() => destroyAreaBox()
	);

	watch(
		() => isActivated.value,
		(newVal) => {
			if (!newVal) {
				destroyAreaBox();
			}
		}
	);

	const isEdit = computed(() => {
		const row = tableInstance.value?.getRowById(selectionStart.rowid);
		return tableInstance.value?.isEditByRow(row);
	});

	watch(
		() => isEdit.value,
		(newVal) => {
			if (newVal) {
				destroyAreaBox();
			}
		}
	);

	onMounted(() => {
		bindView();
		addListener();
	});

	let mutationObserver: MutationObserver | null = null;

	function bindView() {
		nextTick(() => {
			const tableElement = tableInstance.value?.$el;
			if (!tableInstance.value) {
				return;
			}
			tableWrapper.value = tableElement.querySelector(
				'.vxe-table--body-inner-wrapper'
			);
			emptyBlock.value = tableWrapper.value?.querySelector(
				'.vxe-table--empty-block'
			);
			if (tableWrapper.value && areaRef.value) {
				if (emptyBlock.value) {
					tableWrapper.value?.insertBefore(areaRef.value, emptyBlock.value);
				} else {
					tableWrapper.value?.appendChild(areaRef.value);
				}
			}

			// 监听列宽/行高变化
			mutationObserver = new MutationObserver(() => {
				destroyAreaBox();
			});

			const xSpace = tableElement.querySelector('.vxe-body--x-space');
			const ySpace = tableElement.querySelector('.vxe-body--y-space');
			mutationObserver.observe(xSpace, {
				attributes: true,
				childList: true,
				subtree: true,
				attributeFilter: ['style', 'width', 'height'],
			});
			mutationObserver.observe(ySpace, {
				attributes: true,
				childList: true,
				subtree: true,
				attributeFilter: ['style', 'width', 'height'],
			});
		});
	}

	function addListener() {
		nextTick(() => {
			tableWrapper.value?.addEventListener('mousedown', handleMousedown);
			// 监听ctrl+c
			document.addEventListener('keydown', handleKeyDown);
		});
	}

	onUnmounted(() => {
		tableWrapper.value?.removeEventListener('mousedown', handleMousedown);
		document.removeEventListener('keydown', handleKeyDown);

		if (activeAreaInstance === api) {
			activeAreaInstance = null;
		}
		if (mutationObserver) {
			mutationObserver.disconnect();
			mutationObserver = null;
		}
		destroyAreaBox();
	});

	// 销毁选区框
	function destroyAreaBox() {
		copyAreaData.value = null;
		styles.body = {};
		styles.active = {};
		styles.main = {};
		styles.copy = {};
		selectionStart.rowIndex = -1;
		selectionStart.cellIndex = -1;
		selectionEnd.rowIndex = -1;
		selectionEnd.cellIndex = -1;
		selectionStart.colid = '';
		selectionStart.rowid = '';
		selectionEnd.colid = '';
		selectionEnd.rowid = '';
		isSelecting.value = false;
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (!isActivated.value) return;
		if (
			(event.ctrlKey && event.key === 'c') ||
			(event.metaKey && event.key === 'c')
		) {
			copyArea();
		}
		if (
			(event.ctrlKey && event.key === 'v') ||
			(event.metaKey && event.key === 'v')
		) {
			pasteArea();
		}
	}

	function getNextRow(currentRow: any) {
		if (tableInstance.value) {
			// 1. 获取当前可见数据
			const visibleData = tableInstance.value.getTableData().visibleData;

			// 2. 获取当前行的 rowId
			const rowId = tableInstance.value.getRowid(currentRow);

			// 3. 在 visibleData 里查找 rowId 的位置
			const currentIndex = visibleData.findIndex(
				(row) => row._X_ROW_KEY === rowId
			);

			if (currentIndex === -1) {
				return null;
			}
			const nextRow = visibleData[currentIndex + 1] || null;
			return nextRow;
		}
		return null;
	}

	const copyAreaData = ref();

	function copyArea() {
		styles.copy = {
			...styles.main,
			display: 'block',
		};
		const { columns, rows } = getSelectionData();
		copyAreaData.value = {
			columns,
			rows: rows.map((row) => {
				const fields = columns.map((col) => {
					const field = col.field.split('.');
					if (field.length > 1) {
						return field[0];
					}
					return col.field;
				});
				// 根据fields获取新的row数据
				const newRow: any = {};
				fields.forEach((field) => {
					newRow[field] = row[field];
				});
				return newRow;
			}),
		};
	}

	function pasteArea() {
		if (!copyAreaData.value) {
			return;
		}
		const { rows, columns } = getSelectionData();
		const { rows: copyRows, columns: copyColumns } = copyAreaData.value;
		if (copyRows?.length === 0) {
			return;
		}
		// 复制区域是多行的情况
		if (copyRows?.length > 1) {
			/// / 粘贴前需要比对起始的列是否和 复制时候的启始列是一个列，是的话则将复制区域的数据按顺序依次粘贴到对应的列
			if (copyColumns.length > 0 && columns.length > 0) {
				if (copyColumns[0].field === columns[0].field) {
					let currentRow = rows[0];
					for (const item of copyRows) {
						tableInstance.value?.setRow(currentRow, {
							...currentRow,
							...item,
						});
						currentRow = getNextRow(currentRow);
						if (!currentRow) break;
					}
				}
			}
		}
		// 复制区域是单行的情况
		if (copyRows?.length === 1) {
			/// / 粘贴前先比对一下，复制区域的列和粘贴区域时候的列，字段和数量，一样，则将复制区域的一行数据复制到复制区域的每一行
			if (
				copyColumns.length === columns.length &&
				copyColumns.every(
					(col: any) =>
						col.field === columns.find((c: any) => c.field === col.field)?.field
				)
			) {
				rows.forEach((row) => {
					tableInstance.value?.setRow(row, {
						...row,
						...copyRows[0],
					});
				});
			} else {
				// 如果不一样则取启始的列来比对
				if (copyColumns.length > 0 && columns.length > 0) {
					if (copyColumns[0].field === columns[0].field) {
						tableInstance.value?.setRow(rows[0], {
							...rows[0],
							...copyRows[0],
						});
					}
				}
			}
		}
	}
	/**
	 * 获取选区内的数据和对应的列信息
	 *
	 * @returns
	 */
	function getSelectionData() {
		const table = tableInstance.value;
		if (!table) return { columns: [], rows: [] };

		const visibleColumn = table.getTableColumn().visibleColumn || [];
		const visibleData = table.getTableData().visibleData || [];

		// 计算选区的起始和结束位置
		const startRow = Math.min(selectionStart.rowIndex, selectionEnd.rowIndex);
		const endRow = Math.max(selectionStart.rowIndex, selectionEnd.rowIndex);
		const startCol = Math.min(selectionStart.cellIndex, selectionEnd.cellIndex);
		const endCol = Math.max(selectionStart.cellIndex, selectionEnd.cellIndex);

		// 获取选区内的列
		const selectedColumns = visibleColumn.slice(startCol, endCol + 1);

		// 获取选区内的行数据
		const selectedRows = visibleData.slice(startRow, endRow + 1);

		return {
			columns: selectedColumns,
			rows: selectedRows,
		};
	}

	/**
	 * 鼠标按下事件
	 * @param event 鼠标事件
	 */
	function handleMousedown(event: MouseEvent) {
		event.preventDefault();
		tableInstance.value?.closeMenu();
		if (event.button === 0) {
			// 激活当前表格
			if (activeAreaInstance && activeAreaInstance !== api) {
				activeAreaInstance.deactivate();
			}
			isActivated.value = true;
			activeAreaInstance = api;
			// 左键按下
			// 记录选择操作起始位置
			const { rowIndex, cellIndex, colid, rowid } = getCellPosition(
				event.target as HTMLElement
			);

			if (colid) {
				const col = tableInstance.value?.getColumnById(colid);

				if (
					col?.fixed !== undefined ||
					col?.type === 'checkbox' ||
					col?.type === 'radio' ||
					col?.type === 'seq'
				) {
					return;
				}
			}

			selectionStart.rowIndex = rowIndex;
			selectionStart.cellIndex = cellIndex;
			selectionStart.colid = colid || '';
			selectionStart.rowid = rowid || '';
			selectionEnd.rowIndex = rowIndex;
			selectionEnd.cellIndex = cellIndex;
			selectionEnd.colid = colid || '';
			selectionEnd.rowid = rowid || '';
			isSelecting.value = true;

			document.addEventListener('mousemove', handleMousemove);
			document.addEventListener('mouseup', handleMouseup);

			styles.body = {
				display: 'block',
			};
			const cellRect = getCellRect();
			if (cellRect) {
				styles.active = {
					left: `${cellRect?.left}px`,
					top: `${cellRect?.top}px`,
					width: `${cellRect?.width}px`,
					height: `${cellRect?.height}px`,
					display: 'block',
				};
				styles.main = {
					...styles.active,
				};
			}
		}
	}

	function handleMousemove(event: MouseEvent) {
		if (!isSelecting.value) return;

		const wrapper = tableWrapper.value;
		if (!wrapper) return;

		const rect = wrapper.getBoundingClientRect();
		const edgeSize = 20; // 距离边缘多少像素开始滚动
		const scrollStep = 20; // 每次滚动的像素

		let scrollX = 0;
		let scrollY = 0;

		if (event.clientY < rect.top + edgeSize) {
			scrollY = -scrollStep;
		} else if (event.clientY > rect.bottom - edgeSize) {
			scrollY = scrollStep;
		}
		if (event.clientX < rect.left + edgeSize) {
			scrollX = -scrollStep;
		} else if (event.clientX > rect.right - edgeSize) {
			scrollX = scrollStep;
		}

		if (scrollX !== 0 || scrollY !== 0) {
			if (!autoScrollTimer) {
				autoScroll();
			}
		} else {
			if (autoScrollTimer) {
				cancelAnimationFrame(autoScrollTimer);
				autoScrollTimer = null;
			}
		}

		const { rowIndex, cellIndex, colid, rowid } = getCellPosition(
			event.target as HTMLElement
		);
		selectionEnd.rowIndex = rowIndex;
		selectionEnd.cellIndex = cellIndex;
		selectionEnd.colid = colid || '';
		selectionEnd.rowid = rowid || '';
		const areaBox = getAreaBoxRect();
		if (areaBox) {
			styles.main = {
				left:
					typeof areaBox.left === 'number' ? `${areaBox.left}px` : undefined,
				top: `${areaBox.top}px`,
				width: `${areaBox.width}px`,
				height: `${areaBox.height}px`,
				display: 'block',
				...(typeof areaBox.right === 'number'
					? { right: `${areaBox.right}px`, left: undefined }
					: {}),
			};
		} else {
			styles.main = {};
		}

		function autoScroll() {
			if (!isSelecting.value || !wrapper) {
				autoScrollTimer = null;
				return;
			}
			if (scrollY !== 0) {
				wrapper.scrollTop += scrollY;
			}
			if (scrollX !== 0) {
				wrapper.scrollLeft += scrollX;
			}
			autoScrollTimer = requestAnimationFrame(autoScroll);
		}
	}

	function handleMouseup() {
		// 这里可以做一些收尾工作，比如最终选区的处理
		if (isSelecting.value) {
			isSelecting.value = false;
		}
		document.removeEventListener('mousemove', handleMousemove);
		document.removeEventListener('mouseup', handleMouseup);
		if (autoScrollTimer) {
			cancelAnimationFrame(autoScrollTimer);
			autoScrollTimer = null;
		}
	}

	/**
	 * 获取当前选中的单元格的left,top,width,height
	 */
	function getCellRect() {
		const table = tableInstance.value;
		if (!table) return null;

		const visibleColumn = table.getTableColumn().visibleColumn || [];
		const visibleData = table.getTableData().visibleData || [];
		const startRowIndex = selectionStart.rowIndex;
		const startColumnIndex = selectionStart.cellIndex;

		if (startColumnIndex < 0 || startRowIndex < 0) return null;

		// 1. 判断当前列属于哪一块
		const column = visibleColumn[startColumnIndex];
		const fixedType = column.fixed || ''; // 'left' | 'right' | undefined

		// 2. 计算所有列宽
		const colWidths = visibleColumn.map((col) => col.renderWidth || 0);

		// 3. 计算所有行高
		let rowHeights: number[] = [];
		if (table.getRowHeight) {
			rowHeights = visibleData.map((row) => table.getRowHeight(row));
		} else {
			// 默认行高
			const rowHeight = table.cellConfig?.height || 40;
			rowHeights = Array(visibleData.length).fill(rowHeight);
		}

		// 4. 固定列数量
		const leftFixedCount = visibleColumn.filter(
			(col) => col.fixed === 'left'
		).length;
		// const rightFixedCount = visibleColumn.filter(
		// 	(col) => col.fixed === 'right'
		// ).length;

		// 5. 滚动偏移
		// const scrollLeft = table.getScroll()
		// 	? table.getScroll()?.scrollLeft || 0
		// 	: 0;
		// const scrollTop = table.getScroll() ? table.getScroll()?.scrollTop || 0 : 0;

		// 6. 计算 top
		const top = rowHeights.slice(0, startRowIndex).reduce((a, b) => a + b, 0);
		const height = rowHeights[startRowIndex];

		// 7. 计算 left/right/width
		let left = 0;
		let right;
		const width = colWidths[startColumnIndex];

		if (fixedType === 'left') {
			// 左固定列
			left = colWidths.slice(0, startColumnIndex).reduce((a, b) => a + b, 0);
		} else if (fixedType === 'right') {
			// 右固定列
			// 一般用 right 定位
			right = colWidths.slice(startColumnIndex + 1).reduce((a, b) => a + b, 0);
		} else {
			// 主区域
			const leftFixedWidth = colWidths
				.slice(0, leftFixedCount)
				.reduce((a, b) => a + b, 0);
			left =
				leftFixedWidth +
				colWidths
					.slice(leftFixedCount, startColumnIndex)
					.reduce((a, b) => a + b, 0);
		}

		return { left, top, width, height, right };
	}

	/**
	 * 获取单元格位置
	 * @param cell 单元格
	 * @returns 行索引和列索引
	 */
	function getCellPosition(cell: HTMLElement) {
		// 1. 找到TD
		while (cell && cell.tagName !== 'TD') {
			cell = cell.parentElement as HTMLElement;
		}
		if (!cell) return { rowIndex: -1, cellIndex: -1 };

		// 2. 获取全局列和数据
		const table = tableInstance.value;
		const visibleColumn = table?.getTableColumn().visibleColumn || [];

		const visibleData = table?.getTableData().visibleData || [];

		// 3. 获取 colid/rowid
		const colid = cell.getAttribute('colid');
		const rowid = cell.parentElement?.getAttribute('rowid');

		// 4. 全局查找
		const cellIndex = visibleColumn.findIndex((col: any) => col.id === colid);
		const rowIndex = visibleData.findIndex(
			(row: any) => row._X_ROW_KEY === rowid
		);

		return { rowIndex, cellIndex, colid, rowid };
	}

	/**
	 * 获取选区范围框的位置
	 * @returns 选区范围框的位置
	 */
	function getAreaBoxRect() {
		const table = tableInstance.value;
		if (!table) return null;

		const visibleColumn = table.getTableColumn().visibleColumn || [];
		const visibleData = table.getTableData().visibleData || [];

		// 1. 获取起止索引
		const startRow = Math.min(selectionStart.rowIndex, selectionEnd.rowIndex);
		const endRow = Math.max(selectionStart.rowIndex, selectionEnd.rowIndex);
		const startCol = Math.min(selectionStart.cellIndex, selectionEnd.cellIndex);
		const endCol = Math.max(selectionStart.cellIndex, selectionEnd.cellIndex);

		if (
			startRow < 0 ||
			endRow < 0 ||
			startCol < 0 ||
			endCol < 0 ||
			startRow >= visibleData.length ||
			endRow >= visibleData.length ||
			startCol >= visibleColumn.length ||
			endCol >= visibleColumn.length
		) {
			return null;
		}

		// 2. 计算所有列宽
		const colWidths = visibleColumn.map((col) => col.renderWidth || 0);

		// 3. 计算所有行高
		let rowHeights: number[] = [];
		if (table.getRowHeight) {
			rowHeights = visibleData.map((row) => table.getRowHeight(row));
		} else {
			const rowHeight = table.cellConfig?.height || 40;
			rowHeights = Array(visibleData.length).fill(rowHeight);
		}

		// 4. 固定列数量
		const leftFixedCount = visibleColumn.filter(
			(col) => col.fixed === 'left'
		).length;

		// 5. 计算 top 和 height
		const top = rowHeights.slice(0, startRow).reduce((a, b) => a + b, 0);
		const height = rowHeights
			.slice(startRow, endRow + 1)
			.reduce((a, b) => a + b, 0);

		// 6. 计算 left 和 width
		let left = 0;
		let right;
		let width = 0;

		// 判断选区是否全部在左固定、右固定或主区域
		const startFixed = visibleColumn[startCol].fixed;
		const endFixed = visibleColumn[endCol].fixed;

		if (startFixed === 'left' && endFixed === 'left') {
			// 左固定列
			left = colWidths.slice(0, startCol).reduce((a, b) => a + b, 0);
			width = colWidths.slice(startCol, endCol + 1).reduce((a, b) => a + b, 0);
		} else if (startFixed === 'right' && endFixed === 'right') {
			// 右固定列
			// right 定位，left 不用管
			right = colWidths.slice(endCol + 1).reduce((a, b) => a + b, 0);
			width = colWidths.slice(startCol, endCol + 1).reduce((a, b) => a + b, 0);
		} else {
			// 主区域或跨区
			const leftFixedWidth = colWidths
				.slice(0, leftFixedCount)
				.reduce((a, b) => a + b, 0);
			left =
				leftFixedWidth +
				colWidths.slice(leftFixedCount, startCol).reduce((a, b) => a + b, 0);
			width = colWidths.slice(startCol, endCol + 1).reduce((a, b) => a + b, 0);
		}

		return { left, top, width, height, right };
	}

	function renderArea() {
		return (
			<div ref={areaRef} class="lt-table-area" style={styles.body}>
				<span class="vxe-table--cell-main-area" style={styles.main}></span>
				<span class="vxe-table--cell-copy-area" style={styles.copy}></span>
				<span class="vxe-table--cell-active-area" style={styles.active}></span>
			</div>
		);
	}

	function deactivate() {
		isActivated.value = false;
	}

	// 添加判断是否有选区的计算属性
	const hasSelection = computed(
		() =>
			selectionStart.rowIndex >= 0 &&
			selectionStart.cellIndex >= 0 &&
			selectionEnd.rowIndex >= 0 &&
			selectionEnd.cellIndex >= 0
	);

	const api = {
		hasSelection,
		copyAreaData,
		copyArea,
		pasteArea,
		renderArea,
		deactivate,
		destroyAreaBox,
	};
	return api;
}
