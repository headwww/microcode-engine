import {
	IPublicApiMaterial,
	IPublicModelEditor,
	IPublicTypeAssetsJson,
} from '@arvin/microcode-types';
import { globalContext } from '@arvin/microcode-editor-core';
import { getLogger } from '@arvin/microcode-utils';
import { editorSymbol } from '../symbols';

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

	async setAssets(assets: IPublicTypeAssetsJson): Promise<void> {
		return await this[editorSymbol].setAssets(assets);
	}

	getAssets(): IPublicTypeAssetsJson | undefined {
		return this[editorSymbol].get('assets');
	}
}
