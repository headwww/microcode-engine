export interface IPublicModelSkeletonItem {
	name: string;

	visible: boolean;

	disable(): void;

	enable(): void;

	hide(): void;

	show(): void;

	toggle(): void;
}
