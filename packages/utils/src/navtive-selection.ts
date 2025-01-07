/**
 * 控制是否允许原生选择的标志
 */
// eslint-disable-next-line import/no-mutable-exports
export let nativeSelectionEnabled = true;

/**
 * 阻止原生选择事件的处理函数
 * @param e 事件对象
 * @returns null 或 false
 */
const preventSelection = (e: Event) => {
	if (nativeSelectionEnabled) {
		return null;
	}
	e.preventDefault();
	e.stopPropagation();
	return false;
};

// 监听文本选择事件
document.addEventListener('selectstart', preventSelection, true);
// 监听拖拽事件
document.addEventListener('dragstart', preventSelection, true);

/**
 * 设置是否允许原生选择
 * @param enableFlag 是否允许选择的标志
 */
export function setNativeSelection(enableFlag: boolean) {
	nativeSelectionEnabled = enableFlag;
}
