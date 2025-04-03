export default {
	title: '位置',
	position: {
		title: '定位',
		dataList: [
			{
				value: 'static',
				tips: '无定位',
				title: '无定位',
			},
			{
				value: 'relative',
				tips: '相对定位',
				title: '相对定位',
			},
			{
				value: 'absolute',
				tips: '绝对定位',
				title: '绝对定位',
			},
			{
				value: 'fixed',
				tips: '固定定位',
				title: '固定定位',
			},
			{
				value: 'sticky',
				tips: '粘性定位',
				title: '粘性定位',
			},
		],
	},
	float: {
		title: '浮动方向',
		dataList: [
			{
				value: 'none',
				tips: '不浮动',
				title: '不浮动',
			},
			{
				value: 'left',
				tips: '左浮动',
				title: '左浮动',
			},
			{
				value: 'right',
				tips: '右浮动',
				title: '右浮动',
			},
		],
	},
	clear: {
		title: '清除',
		dataList: [
			{
				value: 'none',
				tips: '不清除',
				title: '不清除',
			},
			{
				value: 'left',
				tips: '左清除',
				title: '左清除',
			},
			{
				value: 'right',
				tips: '右清除',
				title: '右清除',
			},
			{
				value: 'both',
				tips: '两边清除',
				title: '两边清除',
			},
		],
	},

	positionTemplete: {
		dataList: [
			{
				value: 'topLeft',
				tips: '左上角',
				title: '左上角',
			},
			{
				value: 'topRight',
				tips: '右上角',
				title: '右上角',
			},
			{
				value: 'bottomLeft',
				tips: '左下角',
				title: '左下角',
			},
			{
				value: 'bottomRight',
				tips: '右下角',
				title: '右下角',
			},
		],
	},
};
