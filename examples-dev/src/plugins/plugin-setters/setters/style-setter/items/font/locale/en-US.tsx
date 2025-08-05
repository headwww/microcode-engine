import {
	TextAlignLeftOrRightIcon,
	TextAlignCenterIcon,
	TextAlignJustifyIcon,
} from '../icons';

export default {
	title: 'Font',
	fontSize: 'fontSize',
	lineHeight: 'lineHeight',
	fontFamily: 'font family',
	color: 'font color',
	opacity: 'opacity',
	fontWeight: {
		title: 'font weight',
		dataList: [
			{
				value: 100,
				label: '100 Thin',
			},
			{
				value: 200,
				label: '200 Extra Light',
			},
			{
				value: 300,
				label: '300 Light',
			},

			{
				value: 400,
				label: '400 Normal',
			},
			{
				value: 500,
				label: '500 Medium',
			},
			{
				value: 600,
				label: '600 Semi Bold',
			},
			{
				value: 700,
				label: '700 Bold',
			},
			{
				value: 800,
				label: 'Extra Bold',
			},
			{
				value: 900,
				label: 'Black',
			},
		],
	},
	textAlign: {
		title: 'text align',
		dataList: [
			{
				value: 'left',
				tips: 'left',
				icon: TextAlignLeftOrRightIcon,
			},
			{
				value: 'center',
				tips: 'center',
				icon: TextAlignCenterIcon,
			},
			{
				value: 'right',
				tips: 'right',
				icon: (
					<TextAlignLeftOrRightIcon style={{ transform: 'rotate(180deg)' }} />
				),
			},
			{
				value: 'justify',
				tips: 'justify',
				icon: TextAlignJustifyIcon,
			},
		],
	},
};
