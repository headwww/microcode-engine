// 全局事件开关标志
let globalEventOn = true;

/**
 * 设置全局事件开关状态
 * @param flag 开关状态,true 为开启,false 为关闭
 */
export function setGlobalEventFlag(flag: boolean) {
	globalEventOn = flag;
}

/**
 * 打开全局事件开关
 */
export function switchGlobalEventOn() {
	setGlobalEventFlag(true);
}

/**
 * 关闭全局事件开关
 */
export function switchGlobalEventOff() {
	setGlobalEventFlag(false);
}

/**
 * 获取全局事件开关状态
 * @returns 当前开关状态
 */
export function isGlobalEventOn() {
	return globalEventOn;
}

/**
 * 在关闭全局事件的情况下执行函数
 * @param fn 需要执行的函数
 */
export function runWithGlobalEventOff(fn: Function) {
	switchGlobalEventOff();
	fn();
	switchGlobalEventOn();
}

type ListenerFunc = (...args: any[]) => void;
/**
 * 包装事件监听函数,只在全局事件开启时执行
 * @param fn 原始监听函数
 * @returns 包装后的监听函数
 */
export function wrapWithEventSwitch(fn: ListenerFunc): ListenerFunc {
	return (...args: any[]) => {
		if (isGlobalEventOn()) fn(...args);
	};
}
