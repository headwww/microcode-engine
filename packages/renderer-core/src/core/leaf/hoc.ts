import {
	defineComponent,
	toRaw,
	h,
	shallowRef,
	Fragment,
	mergeProps,
	watch,
	onUnmounted,
	InjectionKey,
	provide,
	inject,
} from 'vue';
import { IPublicTypeNodeSchema } from '@arvin-shu/microcode-types';
import { leafProps } from '../base';
import {
	buildSchema,
	isFragment,
	SlotSchemaMap,
	splitLeafProps,
	useLeaf,
} from '../use';
import { debounce, exportSchema, isJSSlot } from '../../utils';
import { useRendererContext } from '../renderer-context';

const HOC_NODE_KEY: InjectionKey<{ rerenderSlots: () => void }> =
	Symbol('hocNode');
const useHocNode = (rerenderSlots: () => void) => {
	const { rerender } = useRendererContext();
	const parentNode = inject(HOC_NODE_KEY, null);

	const debouncedRerender = debounce(rerenderSlots);

	provide(HOC_NODE_KEY, {
		rerenderSlots: debouncedRerender,
	});

	if (!parentNode) {
		return {
			rerender: debouncedRerender,
			rerenderRoot: rerender,
			rerenderParent: rerender,
		};
	}
	return {
		rerender: debouncedRerender,
		rerenderRoot: rerender,
		rerenderParent: parentNode.rerenderSlots,
	};
};

export const Hoc = defineComponent({
	name: 'Hoc',
	inheritAttrs: false,
	props: leafProps,
	setup(props, { slots, attrs }) {
		const showNode = shallowRef(true);

		const nodeSchema = shallowRef(props.__schema);

		const slotSchema = shallowRef<SlotSchemaMap>();

		const updateSchema = (newSchema: IPublicTypeNodeSchema) => {
			nodeSchema.value = newSchema;
			slotSchema.value = buildSchema(newSchema).slots;
		};

		const { rerender, rerenderRoot, rerenderParent } = useHocNode(() => {
			const newSchema = node ? exportSchema(node) : null;
			newSchema && updateSchema(newSchema);
		});

		const listenRecord: Record<string, () => void> = {};

		onUnmounted(() =>
			Object.keys(listenRecord).forEach((k) => {
				listenRecord[k]();
				delete listenRecord[k];
			})
		);

		const { locked, node, buildSlots, isRootNode, getNode } = useLeaf(
			props,
			(schema, show) => {
				// eslint-disable-next-line prefer-destructuring
				const id = schema.id;
				if (id) {
					// 如果节点是显示的，并且已经监听过，则取消监听
					if (show && listenRecord[id]) {
						listenRecord[id]();
						delete listenRecord[id];
					} else if (!show && !listenRecord[id]) {
						const childNode = getNode(id);
						if (childNode) {
							// 触发渲染器改变的核心代码逻辑，
							// 1. 监听子节点的显示状态变化（是否创建），然后刷新最外层的组件
							const cancelVisibleChange = childNode.onVisibleChange(() =>
								// TODO 目前在 Hoc 组件中，当属性变化时，无论是什么类型的属性变化，
								// 都直接调用了 rerenderParent()，这导致了不必要的完整重渲染
								rerender()
							);
							// 2. 监听子节点的属性变化，然后刷新最外层的组件
							const cancelPropsChange = childNode.onPropChange(() =>
								rerender()
							);
							listenRecord[id] = () => {
								cancelVisibleChange();
								cancelPropsChange();
							};
						}
					}
				}
			}
		);

		if (node) {
			// 创建数组收集所有清理函数
			const cleanupFunctions: Array<() => void> = [];

			// 注册 onChildrenChange 监听器
			const cancelChildrenChange = node.onChildrenChange(() => {
				// 默认插槽内容变更，无法确定变更的层级，所以只能全部更新
				rerenderRoot();
			});
			cancelChildrenChange && cleanupFunctions.push(cancelChildrenChange);

			// 注册 onPropChange 监听器
			const cancelPropChange = node.onPropChange((info) => {
				const { key, prop, newValue, oldValue } = info;
				const isRootProp = prop.path.length === 1;
				if (isRootProp) {
					if (key === '___isLocked___') {
						locked.value = newValue;
					} else if (isJSSlot(newValue) || isJSSlot(oldValue)) {
						// 插槽内容变更，无法确定变更的层级，所以只能全部更新
						rerenderRoot();
					} else {
						// 普通属性更新，通知父级重新渲染
						rerenderParent();
					}
				} else {
					// 普通属性更新，通知父级重新渲染
					rerenderParent();
				}
			});
			cancelPropChange && cleanupFunctions.push(cancelPropChange);

			// 注册 onVisibleChange 监听器
			const cancelVisibleChange = node.onVisibleChange((visible: boolean) => {
				isRootNode
					? // 当前节点为根节点（Page），直接隐藏
						(showNode.value = visible)
					: // 当前节点显示隐藏发生改变，通知父级组件重新渲染子组件
						rerenderParent();
			});
			cancelVisibleChange && cleanupFunctions.push(cancelVisibleChange);

			// 统一注册卸载时的清理函数
			onUnmounted(() => {
				// TODO 有问题如果开启这个，会导致组件卸载时，所有监听器都被清理，导致无法正常工作
				// cleanupFunctions.forEach((cleanup) => cleanup());
			});

			updateSchema(exportSchema(node));
		}

		watch(
			() => props.__schema,
			(newSchema) => updateSchema(newSchema)
		);

		return () => {
			const comp = toRaw(props.__comp);
			const scope = toRaw(props.__scope);
			const vnodeProps = { ...props.__vnodeProps };
			const compProps = splitLeafProps(attrs)[1];
			if (isRootNode && !showNode.value) return null;

			const builtSlots = slotSchema.value
				? buildSlots(slotSchema.value, scope, node)
				: slots;
			return comp
				? isFragment(comp)
					? h(Fragment, builtSlots.default?.())
					: h(comp, mergeProps(compProps, vnodeProps), builtSlots)
				: h('div', '未找到对应的组件');
		};
	},
});
