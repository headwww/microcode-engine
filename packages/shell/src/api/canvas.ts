import {
	IPublicApiCanvas,
	IPublicModelDragon,
	IPublicModelDropLocation,
	IPublicModelEditor,
	IPublicModelScroller,
	IPublicModelScrollTarget,
	IPublicTypeLocationData,
	IPublicTypeScrollable,
} from '@arvin-shu/microcode-types';
import {
	DropLocation,
	IDesigner,
	ScrollTarget as InnerScrollTarget,
} from '@arvin-shu/microcode-designer';
import { designerSymbol, editorSymbol, nodeSymbol } from '../symbols';
import { Dragon as ShellDragon } from '../model';

// TODO 还有很多功能没有添加进去

export class Canvas implements IPublicApiCanvas {
	private readonly [editorSymbol]: IPublicModelEditor;

	private get [designerSymbol](): IDesigner {
		return this[editorSymbol].get('designer') as IDesigner;
	}

	constructor(
		editor: IPublicModelEditor,
		readonly workspaceMode: boolean = false
	) {
		this[editorSymbol] = editor;
	}

	createScrollTarget(shell: HTMLDivElement): IPublicModelScrollTarget {
		return new InnerScrollTarget(shell);
	}

	createScroller(scrollable: IPublicTypeScrollable): IPublicModelScroller {
		return this[designerSymbol].createScroller(scrollable);
	}

	/**
	 * 创建插入位置，考虑放到 dragon 中
	 */
	createLocation(
		locationData: IPublicTypeLocationData
	): IPublicModelDropLocation {
		const location = new DropLocation(
			this[designerSymbol].createLocation({
				...locationData,
				target: (locationData.target as any)[nodeSymbol],
			})
		);
		return location as any;
	}

	get dragon(): IPublicModelDragon | null {
		return ShellDragon.create(this[designerSymbol].dragon, this.workspaceMode);
	}
}
