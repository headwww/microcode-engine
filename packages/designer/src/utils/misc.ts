import { ISimulatorHost } from '../simulator';
/**
 * 创建一个事件处理器,用于监听所有相关文档上的事件
 * @param boostEvent 触发事件的原始事件对象(鼠标事件或拖拽事件)
 * @param sensors 模拟器实例数组
 * @returns 返回一个函数,该函数接收一个处理器函数作为参数,会在所有相关文档上执行该处理器
 */
export function makeEventsHandler(
	boostEvent: MouseEvent | DragEvent,
	sensors: ISimulatorHost[]
): (fn: (sdoc: Document) => void) => void {
	// 获取顶层文档对象
	const topDoc = window.document;
	// 获取事件源文档,如果不存在则使用顶层文档
	const sourceDoc = boostEvent.view?.document || topDoc;
	// 创建一个Set用于存储需要监听的文档对象
	const docs = new Set<Document>();
	// 添加顶层文档
	docs.add(topDoc);
	// 添加事件源文档
	docs.add(sourceDoc);
	// 遍历所有模拟器实例
	sensors.forEach((sim) => {
		// 获取模拟器的内容文档
		const sdoc = sim.contentDocument;
		if (sdoc) {
			// 如果存在则添加到文档集合中
			docs.add(sdoc);
		}
	});

	// 返回一个函数,该函数会在所有收集到的文档上执行传入的处理器函数
	return (handle: (sdoc: Document) => void) => {
		docs.forEach((doc) => handle(doc));
	};
}
