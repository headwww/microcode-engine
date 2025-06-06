import type { VxeUIPluginObject, VxeGlobalInterceptorHandles } from 'vxe-pc-ui';

function getEventTarget(evnt: Event) {
	const target = evnt.target as HTMLElement | null;
	if (target && (target as any).shadowRoot && evnt.composed) {
		return (evnt.composedPath()[0] as HTMLElement) || target;
	}
	return target;
}

/**
 * 检查触发源是否属于目标节点
 */
function getEventTargetNode(
	evnt: any,
	container: HTMLElement,
	className: string
) {
	let targetElem;
	let target = getEventTarget(evnt);
	const rootEl = document.documentElement || document.querySelector('html');
	while (target && target.nodeType && target !== rootEl) {
		if (
			className &&
			target.className &&
			target.className.split &&
			target.className.split(' ').indexOf(className) > -1
		) {
			targetElem = target;
		} else if (target === container) {
			return { flag: className ? !!targetElem : true, container, targetElem };
		}
		target = target.parentElement;
	}
	return { flag: false };
}

export const VxeUIPluginRenderAntd: VxeUIPluginObject = {
	install(VxeUI, options?: any) {
		const pluginOpts = { prefixCls: 'ant', ...options };

		// 检查版本
		if (!/^(4)\./.test(VxeUI.uiVersion)) {
			// eslint-disable-next-line no-console
			console.error(
				'[VUE_APP_VXE_PLUGIN_VERSION] Requires VUE_APP_VXE_TABLE_VERSION+ version. VUE_APP_VXE_PLUGIN_DESCRIBE'
			);
		}

		/**
		 * 事件兼容性处理
		 */
		const handleClearEvent = (
			params:
				| VxeGlobalInterceptorHandles.InterceptorClearFilterParams
				| VxeGlobalInterceptorHandles.InterceptorClearEditParams
				| VxeGlobalInterceptorHandles.InterceptorClearAreasParams
		) => {
			const { $event } = params;
			const bodyElem = document.body;
			const prefixCls = `${pluginOpts.prefixCls || ''}`.replace(/-$/, '');
			if (
				// 下拉框
				getEventTargetNode($event, bodyElem, `${prefixCls}-select-dropdown`)
					.flag ||
				// 级联
				getEventTargetNode($event, bodyElem, `${prefixCls}-cascader-menus`)
					.flag ||
				// 日期
				getEventTargetNode($event, bodyElem, `${prefixCls}-picker-dropdown`)
					.flag ||
				// 气泡卡片
				getEventTargetNode($event, bodyElem, `${prefixCls}-popover`).flag ||
				// 下拉菜单
				getEventTargetNode($event, bodyElem, `${prefixCls}-dropdown`).flag ||
				getEventTargetNode($event, bodyElem, `${prefixCls}-dropdown-menu`)
					.flag ||
				getEventTargetNode($event, bodyElem, `${prefixCls}-dropdown-menu-item`)
					.flag ||
				getEventTargetNode(
					$event,
					bodyElem,
					`${prefixCls}-calendar-picker-container`
				).flag ||
				// 时间选择
				getEventTargetNode($event, bodyElem, `${prefixCls}-time-picker-panel`)
					.flag
			) {
				return false;
			}
		};

		VxeUI.interceptor.add('event.clearFilter', handleClearEvent);
		VxeUI.interceptor.add('event.clearEdit', handleClearEvent);
		VxeUI.interceptor.add('event.clearAreas', handleClearEvent);

		// 兼容老版本
		VxeUI.interceptor.add('event.clearActived', handleClearEvent);
	},
};

if (typeof window !== 'undefined' && window.VxeUI && window.VxeUI.use) {
	window.VxeUI.use(VxeUIPluginRenderAntd);
}

export default VxeUIPluginRenderAntd;
