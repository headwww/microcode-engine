import { INode } from '@arvin-shu/microcode-designer';
import { IPublicTypeNodeSchema } from '@arvin-shu/microcode-types';
import {
	Component,
	ComponentPublicInstance,
	getCurrentInstance,
	inject,
	InjectionKey,
} from 'vue';

export type DesignMode = 'live' | 'design';

export interface RendererContext {
	readonly thisRequiredInJSE: boolean;
	readonly components: Record<string, Component<any, any, any>>;
	readonly designMode: DesignMode;
	getNode(id: string): INode | null;
	rerender(): void;
	wrapLeafComp<C extends object, L extends object>(
		name: string,
		comp: C,
		leaf: L
	): L;
	triggerCompGetCtx(
		schema: IPublicTypeNodeSchema,
		val: ComponentPublicInstance
	): void;
}

export function getRendererContextKey(): InjectionKey<RendererContext> {
	let key = (window as any).__rendererContext;
	if (!key) {
		key = Symbol('__rendererContext');
		(window as any).__rendererContext = key;
	}
	return key;
}

export function useRendererContext(): RendererContext {
	const key = getRendererContextKey();
	return inject(
		key,
		() => {
			const props = getCurrentInstance()?.props ?? {};
			return {
				// eslint-disable-next-line no-void
				rerender: () => void 0,
				thisRequiredInJSE: true,
				components: getPropValue(props, 'components', {}),
				designMode: getPropValue<DesignMode>(props, 'designMode', 'live'),
				wrapLeafComp: <T extends object, L extends object>(
					_: string,
					__: T,
					leaf: L
				) => leaf,
				getNode: getPropValue(props, 'getNode', () => null),
				triggerCompGetCtx: getPropValue(
					props,
					'triggerCompGetCtx',
					// eslint-disable-next-line no-void
					() => void 0
				),
			};
		},
		true
	);
}

function getPropValue<T>(
	props: Record<string, unknown>,
	key: string,
	defaultValue: T
): T {
	return (props[key] || props[`__${key}`] || defaultValue) as T;
}
