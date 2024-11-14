import {
	IPublicApiMaterial,
	IPublicModelEditor,
	IPublicTypeAssetsJson,
	IPublicTypeDisposable,
} from '@arvin/microcode-types';
import { globalContext } from '@arvin/microcode-editor-core';
import { getLogger } from '@arvin/microcode-utils';
import { IDesigner } from '@arvin/microcode-designer';
import { designerSymbol, editorSymbol } from '../symbols';

const innerEditorSymbol = Symbol('editor');

const logger = getLogger({ level: 'warn', bizName: 'shell-material' });

export class Material implements IPublicApiMaterial {
	private readonly [innerEditorSymbol]: IPublicModelEditor;

	get [editorSymbol](): IPublicModelEditor {
		if (this.workspaceMode) {
			return this[innerEditorSymbol];
		}
		const workspace = globalContext.get('workspace');
		if (workspace.isActive) {
			if (!workspace.window.editor) {
				logger.error('Material api 调用时机出现问题，请检查');
				return this[innerEditorSymbol];
			}
			return workspace.window.editor;
		}

		return this[innerEditorSymbol];
	}

	constructor(
		editor: IPublicModelEditor,
		readonly workspaceMode: boolean = false
	) {
		this[innerEditorSymbol] = editor;
	}

	/**
	 * 获取设计器实例
	 * 设计器实例在引擎注册初始化的时候构建的存储在editor中的
	 */
	get [designerSymbol](): IDesigner {
		return this[editorSymbol].get('designer')!;
	}

	/**
	 * 设置「资产包」结构
	 * @param assets
	 */
	async setAssets(assets: IPublicTypeAssetsJson): Promise<void> {
		return await this[editorSymbol].setAssets(assets);
	}

	/**
	 * 获取「资产包」结构
	 */
	getAssets(): IPublicTypeAssetsJson | undefined {
		return this[editorSymbol].get('assets');
	}

	/**
	 * 监听 assets 变化的事件
	 * @param fn
	 */
	onChangeAssets(fn: () => void): IPublicTypeDisposable {
		const disable = [
			// 设置 assets，经过 setAssets 赋值
			this[editorSymbol].onChange('assets', fn),
			// 增量设置 assets，经过 loadIncrementalAssets 赋值
			this[editorSymbol].eventBus.on('designer.incrementalAssetsReady', fn),
		];
		return () => {
			disable.forEach((d) => d && d());
		};
	}
}
