import { computed, defineComponent } from 'vue';
import './index.scss';

export const LayersPane = defineComponent({
	name: 'LayersPane',
	inheritAttrs: false,
	setup() {
		return () => (
			<div class="mtc-layers-pane">
				<div class={'mtc-layers-container'}>
					<TreeView />
				</div>
			</div>
		);
	},
});

export const TreeView = defineComponent({
	name: 'TreeView',
	inheritAttrs: false,
	setup() {
		return () => (
			<div class="mtc-layers-tree">
				<TreeNodeView />
			</div>
		);
	},
});

export const TreeNodeView = defineComponent({
	name: 'TreeNodeView',
	inheritAttrs: false,
	setup() {
		const className = computed(() => ({
			'mtc-tree-node': true,
		}));
		return () => (
			<div class={className.value}>
				<TreeTitle />
				<TreeBranches />
			</div>
		);
	},
});

export const TreeBranches = defineComponent({
	name: 'TreeBranches',
	inheritAttrs: false,
	setup() {
		return () => <div class="mtc-tree-node-branches"></div>;
	},
});

export const TreeTitle = defineComponent({
	name: 'TreeTitle',
	inheritAttrs: false,
	setup() {
		return () => <div class="mtc-tree-node-title"></div>;
	},
});
