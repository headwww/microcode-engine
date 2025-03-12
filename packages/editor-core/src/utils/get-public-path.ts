// 获取当前脚本文件所在的目录路径
// 例如: 如果脚本文件路径是 https://example.com/assets/script.js
// 则返回 https://example.com/assets/
const publicPath = (document.currentScript as HTMLScriptElement)?.src.replace(
	/^(.*\/)[^/]+$/,
	'$1'
);

/**
 * 获取当前脚本文件所在的公共路径
 * @returns 返回脚本文件所在目录的URL路径,如果获取失败则返回空字符串
 */
export function getPublicPath(): string {
	return publicPath || '';
}
