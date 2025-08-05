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
	title: '布局',
	width: '宽度',
	height: '高度',
	padding: '内边距',
	margin: '外边距',
	display: {
		title: '布局模式',
		dataList: [
			{
				value: 'inline',
				tips: '内联布局',
				icon: DisplayInlineIcon,
			},
			{
				value: 'flex',
				tips: '弹性布局',
				icon: DisplayFlexIcon,
			},
			{
				value: 'block',
				tips: '块级布局',
				icon: DisplayBlockIcon,
			},
			{
				value: 'inline-block',
				tips: '内联块布局',
				icon: DisplayInlineBlockIcon,
			},
			{
				value: 'none',
				tips: '隐藏',
				icon: DisplayNoneIcon,
			},
		],
	},
	flexDirection: {
		title: '主轴方向',
		dataList: [
			{
				value: 'row',
				tips: '水平方向，起点在左侧',
				icon: FlexDirectionRowIcon,
			},
			{
				value: 'column',
				tips: '垂直方向，起点在上沿',
				icon: FlexDirectionColumnIcon,
			},
			{
				value: 'row-reverse',
				tips: '水平方向，起点在右侧',
				icon: FlexDirectionRowReverseIcon,
			},

			{
				value: 'column-reverse',
				tips: '垂直方向，起点在下沿',
				icon: FlexDirectionColumnReverseIcon,
			},
		],
	},
	justifyContent: {
		title: '主轴对齐',
		dataList: [
			{
				value: 'flex-start',
				tips: '左对齐',
				icon: JustifyContentFlexStartRowIcon,
			},
			{
				value: 'flex-end',
				tips: '右对齐',
				icon: JustifyContentFlexEndRowIcon,
			},
			{
				value: 'center',
				tips: '水平居中',
				icon: JustifyContentCenterRowIcon,
			},
			{
				value: 'space-between',
				tips: '两端对齐',
				icon: JustifyContentSpaceBetweenRowIcon,
			},
			{
				value: 'space-around',
				tips: '横向平分',
				icon: JustifyContentSpaceAroundRowIcon,
			},
		],
	},
	alignItems: {
		title: '辅轴对齐',
		dataList: [
			{
				value: 'flex-start',
				tips: '起点对齐',
				icon: AlignItemsFlexStartRowIcon,
			},
			{
				value: 'flex-end',
				tips: '终点对齐',
				icon: AlignItemsFlexEndRowIcon,
			},
			{
				value: 'center',
				tips: '水平居中',
				icon: AlignItemsCenterRowIcon,
			},
			{
				value: 'baseline',
				tips: '项目第一行文字的基线对齐',
				icon: AlignItemsBaselineRowIcon,
			},
			{
				value: 'stretch',
				tips: '沾满整个容器的高度',
				icon: AlignItemsStretchRowIcon,
			},
		],
	},
	flexWrap: {
		title: '换行',
		dataList: [
			{
				value: 'nowrap',
				tips: '不换行',
				title: '不换行',
			},
			{
				value: 'wrap',
				tips: '第一行在上方',
				title: '正换行',
			},
			{
				value: 'wrap-reverse',
				tips: '第一行在下方',
				title: '逆换行',
			},
		],
	},
};
