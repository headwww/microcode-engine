import { ref, toRaw } from 'vue';
import {
	createModuleEventBus,
	IEventBus,
} from '@arvin-shu/microcode-editor-core';
import { IPublicModelDetecting } from '@arvin-shu/microcode-types';
import type { IDocumentModel } from '../document/document-model';
import type { INode } from '../document/node/node';

const DETECTING_CHANGE_EVENT = 'detectingChange';
export interface IDetecting
	extends Omit<IPublicModelDetecting<INode>, 'capture' | 'release' | 'leave'> {
	capture(node: INode | null): void;

	release(node: INode | null): void;

	leave(document: IDocumentModel | undefined): void;

	get current(): INode | null;
}

export class Detecting implements IDetecting {
	private _enable = ref(true);

	/**
	 * 控制大纲树 hover 时是否出现悬停效果
	 * TODO: 将该逻辑从设计器中抽离出来
	 */
	get enable() {
		return this._enable.value;
	}

	set enable(flag: boolean) {
		this._enable.value = flag;
		if (!flag) {
			this._current.value = null;
		}
	}

	xRayMode = ref(false);

	/**
	 * 当前选中的节点
	 */
	_current = ref<INode | null>(null);

	/**
	 * 事件总线
	 */
	private emitter: IEventBus = createModuleEventBus('Detecting');

	get current(): any {
		return this._current.value;
	}

	/**
	 * 捕获节点
	 * @param node
	 */
	capture(node: INode | null) {
		if (this._current.value !== node) {
			this._current.value = node;
			this.emitter.emit(DETECTING_CHANGE_EVENT, this.current);
		}
	}

	/**
	 * 释放节点
	 * @param node
	 */
	release(node: INode | null) {
		if (toRaw(this._current.value) === toRaw(node)) {
			this._current.value = null;
			this.emitter.emit(DETECTING_CHANGE_EVENT, this.current);
		}
	}

	/**
	 * 离开文档
	 * @param document
	 */
	leave(document: IDocumentModel | undefined) {
		if (this.current && toRaw(this.current.document) === toRaw(document)) {
			this._current.value = null;
		}
	}

	/**
	 * 监听检测变化
	 * @param fn
	 * @returns
	 */
	onDetectingChange(fn: (node: INode) => void) {
		this.emitter.on(DETECTING_CHANGE_EVENT, fn);
		return () => {
			this.emitter.off(DETECTING_CHANGE_EVENT, fn);
		};
	}
}
