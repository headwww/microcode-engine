import { IDragon } from '@arvin-shu/microcode-designer';
import { globalContext } from '@arvin-shu/microcode-editor-core';
import {
	IPublicModelDragObject,
	IPublicModelDragon,
	IPublicTypeDisposable,
	IPublicTypeDragNodeDataObject,
} from '@arvin-shu/microcode-types';
import { dragonSymbol } from '../symbols';

export const innerDragonSymbol = Symbol('innerDragonSymbol');
export class Dragon implements IPublicModelDragon {
	private readonly [innerDragonSymbol]: IDragon;

	get [dragonSymbol](): IDragon {
		if (this.workspaceMode) {
			return this[innerDragonSymbol];
		}
		const workspace = globalContext.get('workspace');
		let editor = globalContext.get('editor');

		if (workspace.isActive) {
			editor = workspace.window.editor;
		}

		const designer = editor.get('designer');
		return designer.dragon;
	}

	constructor(
		innerDragon: IDragon,
		readonly workspaceMode: boolean
	) {
		this[innerDragonSymbol] = innerDragon;
	}

	static create(
		dragon: IDragon | null,
		workspaceMode: boolean
	): IPublicModelDragon | null {
		if (!dragon) {
			return null;
		}
		return new Dragon(dragon, workspaceMode);
	}

	/**
	 * 设置拖拽监听的区域 shell，以及自定义拖拽转换函数 boost
	 * @param shell 拖拽监听的区域
	 * @param boost 拖拽转换函数
	 */
	from(
		shell: Element,
		boost: (e: MouseEvent) => IPublicTypeDragNodeDataObject | null
	): any {
		return this[dragonSymbol].from(shell, boost);
	}

	onDragend(
		func: (o: { dragObject: IPublicModelDragObject; copy?: boolean }) => any
	): IPublicTypeDisposable {
		func;
		throw new Error('Method not implemented.');
	}
}
