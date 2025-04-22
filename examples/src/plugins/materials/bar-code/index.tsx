import { defineComponent, ref, onMounted, watch, PropType } from 'vue';
import JsBarcode from 'jsbarcode';

export default defineComponent({
	name: 'Barcode',
	props: {
		/**
		 * 要在条形码中编码的值
		 */
		value: {
			type: String as PropType<string>,
			required: true,
		},
		/**
		 * 传递给 JsBarcode 的配置项
		 * 详情见: https://github.com/lindell/JsBarcode#options
		 */
		options: {
			type: Object as PropType<Record<string, any>>,
			default: () => ({
				fontSize: 14,
				width: 1.5,
				height: 80,
			}),
		},
		/**
		 * 渲染元素类型，可选 'svg' 或 'canvas'
		 * 默认为 'svg'
		 */
		tag: {
			type: String as PropType<'svg' | 'canvas'>,
			default: 'svg',
		},
	},
	setup(props) {
		// 获取 SVG 或 Canvas 的引用
		const barcodeRef = ref<SVGSVGElement | HTMLCanvasElement | null>(null);

		// 渲染条形码的方法
		const renderBarcode = () => {
			if (!barcodeRef.value) return;
			// 清除已有内容
			if (props.tag === 'svg') {
				(barcodeRef.value as SVGSVGElement).innerHTML = '';
			} else {
				const canvas = barcodeRef.value as HTMLCanvasElement;
				const ctx = canvas.getContext('2d');
				ctx && ctx.clearRect(0, 0, canvas.width, canvas.height);
			}
			// 使用 JsBarcode 生成条形码
			JsBarcode(barcodeRef.value as any, props.value, props.options);
		};

		// 组件挂载后首次渲染
		onMounted(renderBarcode);

		// 监听 value、options 或 tag 变化后重新渲染
		watch(() => [props.value, props.options, props.tag], renderBarcode, {
			deep: true,
		});

		// 返回渲染函数，根据 tag 决定渲染 SVG 还是 Canvas
		return () => {
			const Tag = props.tag;
			return <Tag ref={barcodeRef} />;
		};
	},
});
