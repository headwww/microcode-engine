import {
	DisplayInlineIcon,
	DisplayFlexIcon,
	DisplayBlockIcon,
	DisplayInlineBlockIcon,
	DisplayNoneIcon,
	JustifyContentFlexStartRowIcon,
	JustifyContentFlexEndRowIcon,
	JustifyContentCenterRowIcon,
	JustifyContentSpaceBetweenRowIcon,
	JustifyContentSpaceAroundRowIcon,
	AlignItemsFlexStartRowIcon,
	AlignItemsFlexEndRowIcon,
	AlignItemsCenterRowIcon,
	AlignItemsBaselineRowIcon,
	AlignItemsStretchRowIcon,
	FlexDirectionRowIcon,
	FlexDirectionRowReverseIcon,
	FlexDirectionColumnIcon,
	FlexDirectionColumnReverseIcon,
} from '../icons';

export default {
	title: 'Layout',
	width: 'width',
	height: 'height',
	padding: 'padding',
	margin: 'margin',
	display: {
		title: 'display',
		dataList: [
			{
				value: 'inline',
				tips: 'inline',
				icon: DisplayInlineIcon,
			},
			{
				value: 'flex',
				tips: 'flex',
				icon: DisplayFlexIcon,
			},
			{
				value: 'block',
				tips: 'block',
				icon: DisplayBlockIcon,
			},
			{
				value: 'inline-block',
				tips: 'inline-block',
				icon: DisplayInlineBlockIcon,
			},
			{
				value: 'none',
				tips: 'none',
				icon: DisplayNoneIcon,
			},
		],
	},
	flexDirection: {
		title: 'flex direction',
		dataList: [
			{
				value: 'row',
				tips: 'row',
				icon: FlexDirectionRowIcon,
			},
			{
				value: 'column',
				tips: 'column',
				icon: FlexDirectionColumnIcon,
			},
			{
				value: 'row-reverse',
				tips: 'row-reverse',
				icon: FlexDirectionRowReverseIcon,
			},
			{
				value: 'column-reverse',
				tips: 'column-reverse',
				icon: FlexDirectionColumnReverseIcon,
			},
		],
	},
	justifyContent: {
		title: 'justify content',
		dataList: [
			{
				value: 'flex-start',
				tips: 'flex-start',
				icon: JustifyContentFlexStartRowIcon,
			},
			{
				value: 'flex-end',
				tips: 'flex-end',
				icon: JustifyContentFlexEndRowIcon,
			},
			{
				value: 'center',
				tips: 'center',
				icon: JustifyContentCenterRowIcon,
			},
			{
				value: 'space-between',
				tips: 'space-between',
				icon: JustifyContentSpaceBetweenRowIcon,
			},
			{
				value: 'space-around',
				tips: 'space-around',
				icon: JustifyContentSpaceAroundRowIcon,
			},
		],
	},
	alignItems: {
		title: 'align items',
		dataList: [
			{
				value: 'flex-start',
				tips: 'flex-start',
				icon: AlignItemsFlexStartRowIcon,
			},
			{
				value: 'flex-end',
				tips: 'flex-end',
				icon: AlignItemsFlexEndRowIcon,
			},
			{
				value: 'center',
				tips: 'center',
				icon: AlignItemsCenterRowIcon,
			},
			{
				value: 'baseline',
				tips: 'baseline',
				icon: AlignItemsBaselineRowIcon,
			},
			{
				value: 'stretch',
				tips: 'stretch',
				icon: AlignItemsStretchRowIcon,
			},
		],
	},
	flexWrap: {
		title: 'flexWrap',
		dataList: [
			{
				value: 'nowrap',
				tips: 'nowrap',
				title: 'nowrap',
			},
			{
				value: 'wrap',
				tips: 'wrap',
				title: 'wrap',
			},
			{
				value: 'wrap-reverse',
				tips: 'wrap-reverse',
				title: 'wrap-reverse',
			},
		],
	},
};
