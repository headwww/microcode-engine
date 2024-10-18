/**
 * 该函数用于判断一个事件名称是否具有插件事件的格式（通过冒号区分的多段命名）
 *
 * @param eventName
 * @returns
 */
export function isPluginEventName(eventName: string): boolean {
	if (!eventName) {
		return false;
	}

	const eventSegments = eventName.split(':');
	return eventSegments.length > 1 && eventSegments[0].length > 0;
}
