import {
	TextAlignLeftOrRightIcon,
	TextAlignCenterIcon,
	TextAlignJustifyIcon,
} from '../icons';

export default {
	title: '文字',
	fontSize: '字号',
	lineHeight: '行高',
	fontFamily: '字体',
	color: '文字颜色',
	opacity: '透明度',
	fontWeight: {
		title: '字重',
		dataList: [
			{
				value: 100,
				label: '100 纤细',
			},
			{
				value: 200,
				label: '200 极细',
			},
			{
				value: 300,
				label: '300 细',
			},

			{
				value: 400,
				label: '400 正常',
			},
			{
				value: 500,
				label: '500 中',
			},
			{
				value: 600,
				label: '600 半粗',
			},
			{
				value: 700,
				label: '700 粗',
			},
			{
				value: 800,
				label: '800 黑',
			},
			{
				value: 900,
				label: '900 重',
			},
		],
	},
	textAlign: {
		title: '对齐方式',
		dataList: [
			{
				value: 'left',
				tips: '左对齐',
				icon: TextAlignLeftOrRightIcon,
			},
			{
				value: 'center',
				tips: '居中对齐',
				icon: TextAlignCenterIcon,
			},
			{
				value: 'right',
				tips: '右对齐',
				icon: (
					<TextAlignLeftOrRightIcon style={{ transform: 'rotate(180deg)' }} />
				),
			},
			{
				value: 'justify',
				tips: '两端对齐',
				icon: TextAlignJustifyIcon,
			},
		],
	},
};
