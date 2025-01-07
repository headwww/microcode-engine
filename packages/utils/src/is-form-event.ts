/**
 * 判断事件是否来自表单元素
 * @param e 键盘事件或鼠标事件
 * @returns 如果事件来自表单元素返回true,否则返回false
 */
export function isFormEvent(e: KeyboardEvent | MouseEvent) {
	// 获取事件目标元素并转换为表单元素类型
	const t = e.target as HTMLFormElement;
	if (!t) {
		return false;
	}

	// 检查是否为表单元素或表单相关的输入元素
	if (t.form || /^(INPUT|SELECT|TEXTAREA)$/.test(t.tagName)) {
		return true;
	}

	// 检查元素是否可编辑(通过webkit用户修改样式属性)
	if (
		t instanceof HTMLElement &&
		/write/.test(
			window.getComputedStyle(t).getPropertyValue('-webkit-user-modify')
		)
	) {
		return true;
	}
	return false;
}
