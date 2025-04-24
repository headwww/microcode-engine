export interface ActionConfig {
	title?: string;
	width?: number;
	buttonType?: string;
	hidden?: boolean;
	maxShowCount?: number;
	fixed?: 'left' | 'right' | 'none';
	actions?: Array<{
		title: string;
		onAction?: () => void;
		onDisabled?: (params: any) => boolean;
	}>;
}
