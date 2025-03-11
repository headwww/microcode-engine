import {
	IPublicApiCanvas,
	IPublicModelActiveTracker,
	IPublicModelDragon,
	IPublicModelDropLocation,
	IPublicModelEditor,
	IPublicModelScroller,
	IPublicModelScrollTarget,
	IPublicTypeLocationData,
	IPublicTypeScrollable,
	IPublicModelClipboard,
} from '@arvin-shu/microcode-types';
import {
	DropLocation,
	IDesigner,
	ScrollTarget as InnerScrollTarget,
} from '@arvin-shu/microcode-designer';
import { designerSymbol, editorSymbol, nodeSymbol } from '../symbols';
import {
	Dragon as ShellDragon,
	ActiveTracker as ShellActiveTracker,
	Clipboard as ShellClipboard,
} from '../model';

const clipboardInstanceSymbol = Symbol('clipboardInstace');

export class Canvas implements IPublicApiCanvas {
	private readonly [editorSymbol]: IPublicModelEditor;

	private readonly [clipboardInstanceSymbol]: IPublicModelClipboard;

	private get [designerSymbol](): IDesigner {
		return this[editorSymbol].get('designer') as IDesigner;
	}

	constructor(
		editor: IPublicModelEditor,
		readonly workspaceMode: boolean = false
	) {
		this[editorSymbol] = editor;
		this[clipboardInstanceSymbol] = new ShellClipboard();
	}

	get activeTracker(): IPublicModelActiveTracker | null {
		const activeTracker = new ShellActiveTracker(
			this[designerSymbol].activeTracker
		);
		return activeTracker;
	}

	get isInLiveEditing(): boolean {
		return Boolean(
			this[editorSymbol].get('designer')?.project?.simulator?.liveEditing
				?.editing
		);
	}

	get clipboard(): IPublicModelClipboard {
		return this[clipboardInstanceSymbol];
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
