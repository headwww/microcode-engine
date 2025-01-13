import { globalContext, ISetters } from '@arvin-shu/microcode-editor-core';
import {
	IPublicApiSetters,
	IPublicTypeCustomView,
	IPublicTypeRegisteredSetter,
} from '@arvin-shu/microcode-types';
import { getLogger } from '@arvin-shu/microcode-utils';
import { VNode } from 'vue';

const innerSettersSymbol = Symbol('setters');
const settersSymbol = Symbol('setters');

const logger = getLogger({ level: 'warn', bizName: 'shell-setters' });

export class Setters implements IPublicApiSetters {
	readonly [innerSettersSymbol]: ISetters;

	get [settersSymbol](): ISetters {
		if (this.workspaceMode) {
			return this[innerSettersSymbol];
		}

		const workspace = globalContext.get('workspace');
		if (workspace.isActive) {
			if (!workspace.window?.innerSetters) {
				logger.error('setter api 调用时机出现问题，请检查');
				return this[innerSettersSymbol];
			}
			return workspace.window.innerSetters;
		}

		return this[innerSettersSymbol];
	}

	constructor(
		innerSetters: ISetters,
		readonly workspaceMode = false
	) {
		this[innerSettersSymbol] = innerSetters;
	}

	/**
	 * 获取指定 setter
	 * @param type
	 * @returns
	 */
	getSetter = (type: string) => this[settersSymbol].getSetter(type);

	/**
	 * 获取已注册的所有 settersMap
	 * @returns
	 */
	getSettersMap = (): Map<
		string,
		IPublicTypeRegisteredSetter & {
			type: string;
		}
	> => this[settersSymbol].getSettersMap();

	/**
	 * 注册一个 setter
	 * @param typeOrMaps
	 * @param setter
	 * @returns
	 */
	registerSetter = (
		typeOrMaps:
			| string
			| { [key: string]: IPublicTypeCustomView | IPublicTypeRegisteredSetter },
		setter?: IPublicTypeCustomView | IPublicTypeRegisteredSetter | undefined
	) => this[settersSymbol].registerSetter(typeOrMaps, setter);

	/**
	 * @deprecated
	 */
	createSetterContent = (
		setter: any,
		props: Record<string, any>
	): VNode | null => this[settersSymbol].createSetterContent(setter, props);
}
