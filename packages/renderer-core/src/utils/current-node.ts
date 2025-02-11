import type {
	GlobalEvent,
	IPublicModelNode,
	IPublicTypeDisposable,
} from '@arvin-shu/microcode-types';
import type { InjectionKey } from 'vue';
import { inject } from 'vue';
import { DesignMode } from '../core';

export type IPublicTypePropChangeOptions = Omit<
	GlobalEvent.Node.Prop.ChangeOptions,
	'node'
>;

export interface INode extends IPublicModelNode {
	onVisibleChange(func: (flag: boolean) => any): () => void;
	onPropChange(
		func: (info: IPublicTypePropChangeOptions) => void
	): IPublicTypeDisposable;
	onChildrenChange(
		fn: (param?: { type: string; node: INode } | undefined) => void
	): IPublicTypeDisposable | undefined;
}

export interface EnvNode {
	mode: DesignMode;
	node: INode | null;
	isDesignerEnv: boolean;
}

export interface DesignerEnvNode extends EnvNode {
	mode: 'design';
	node: INode;
	isDesignerEnv: true;
}

export interface LiveEnvNode extends EnvNode {
	mode: 'live';
	node: null;
	isDesignerEnv: false;
}

export type CurrentNode = DesignerEnvNode | LiveEnvNode;

export function getCurrentNodeKey(): InjectionKey<CurrentNode> {
	let key = (window as any).__currentNode;
	if (!key) {
		key = Symbol('__currentNode');
		(window as any).__currentNode = key;
	}
	return key;
}

export function useCurrentNode(): CurrentNode {
	const key = getCurrentNodeKey();
	return inject(
		key,
		() =>
			({
				mode: 'live',
				node: null,
				isDesignerEnv: false,
			}) as LiveEnvNode,
		true
	);
}
