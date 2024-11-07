import {
	IPublicApiCanvas,
	IPublicModelDragon,
	IPublicModelEditor,
} from '@arvin/microcode-types';
import { IDesigner } from '@arvin/microcode-designer';
import { designerSymbol, editorSymbol } from '../symbols';
import { Dragon as ShellDragon } from '../model';

export class Canvas implements IPublicApiCanvas {
	private readonly [editorSymbol]: IPublicModelEditor;

	constructor(
		editor: IPublicModelEditor,
		readonly workspaceMode: boolean = false
	) {
		this[editorSymbol] = editor;
	}

	private get [designerSymbol](): IDesigner {
		return this[editorSymbol].get('designer') as IDesigner;
	}

	get dragon(): IPublicModelDragon | null {
		return ShellDragon.create(this[designerSymbol].dragon, this.workspaceMode);
	}
}
