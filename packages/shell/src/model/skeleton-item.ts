import {
	Dock,
	IWidget,
	Panel,
	PanelDock,
	Widget,
	Stage,
} from '@arvin-shu/microcode-editor-skeleton';
import { IPublicModelSkeletonItem } from '@arvin-shu/microcode-types';
import { skeletonItemSymbol } from '../symbols';

export class SkeletonItem implements IPublicModelSkeletonItem {
	private [skeletonItemSymbol]:
		| IWidget
		| Widget
		| Panel
		| Dock
		| PanelDock
		| Stage;

	constructor(
		skeletonItem: IWidget | Widget | Panel | Dock | Stage | PanelDock
	) {
		this[skeletonItemSymbol] = skeletonItem;
	}

	get name() {
		return this[skeletonItemSymbol].name;
	}

	get visible() {
		return this[skeletonItemSymbol].visible.value;
	}

	disable() {
		this[skeletonItemSymbol].disable?.();
	}

	enable() {
		this[skeletonItemSymbol].enable?.();
	}

	hide() {
		this[skeletonItemSymbol].hide();
	}

	show() {
		this[skeletonItemSymbol].show();
	}

	toggle() {
		this[skeletonItemSymbol].toggle();
	}
}
