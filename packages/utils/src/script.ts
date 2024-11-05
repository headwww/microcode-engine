import { createDefer } from './create-defer';

/**
 * 动态的执行一段script脚本
 *
 * @param script
 * @param scriptType
 */
export function evaluate(script: string, scriptType?: string) {
	// 创建一个新的 script 元素
	const scriptEl = document.createElement('script');

	// 如果传递了 scriptType 参数，则设置 script 元素的 type 属性
	scriptType && (scriptEl.type = scriptType);

	// 设置 script 元素的 text 属性为传入的脚本内容
	scriptEl.text = script;

	// 将 script 元素添加到 document.head 中，这会立即执行脚本
	document.head.appendChild(scriptEl);

	// 执行完成后，立即从 document.head 中移除该 script 元素
	document.head.removeChild(scriptEl);
}

/**
 * 动态加载外部 JS 文件，并在加载成功时返回一个 Promise，支持错误处理
 *
 * @param url
 * @param scriptType
 * @returns
 */
export function load(url: string, scriptType?: string) {
	// 创建一个新的 script 元素
	const node = document.createElement('script');

	// 监听加载成功或失败事件
	node.onload = onload;
	node.onerror = onload;

	// 创建一个 Deferred 对象，用于返回 Promise
	const i = createDefer();

	// 处理 onload 和 onerror 事件
	function onload(e: any) {
		node.onload = null;
		node.onerror = null;
		if (e.type === 'load') {
			i.resolve(); // 加载成功时，调用 resolve()
		} else {
			i.reject(); // 加载失败时，调用 reject()
		}
	}

	// 设置 script 元素的 src 属性为传入的 url
	node.src = url;

	// 确保脚本按顺序执行，设置 async = false
	node.async = false;

	// 如果有传递 scriptType 参数，则设置 script 元素的 type 属性
	scriptType && (node.type = scriptType);

	// 将 script 元素添加到 head 中，开始加载脚本
	document.head.appendChild(node);

	// 返回一个 Promise 对象，表示加载状态
	return i.promise();
}
