// 抖动距离
const SHAKE_DISTANCE = 4;

/**
 * 检查鼠标是否抖动
 */
export function isShaken(
	e1: MouseEvent | DragEvent,
	e2: MouseEvent | DragEvent
): boolean {
	if ((e1 as any).shaken) {
		return true;
	}
	if (e1.target !== e2.target) {
		return true;
	}
	return (
		(e1.clientY - e2.clientY) ** 2 + (e1.clientX - e2.clientX) ** 2 >
		SHAKE_DISTANCE
	);
}
