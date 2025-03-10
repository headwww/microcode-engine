import {
	IPublicModelHistory,
	IPublicModelPluginContext,
	IPublicTypeDisposable,
} from '@arvin-shu/microcode-types';
import { Button, Space } from 'ant-design-vue';
import { defineComponent, onMounted, onUnmounted, ref } from 'vue';
import { project } from '@arvin-shu/microcode-engine';
import { UndoIcon } from './icons/undo';
import { RedoIcon } from './icons/redo';

const UndoRedo = defineComponent({
	name: 'UndoRedo',
	inheritAttrs: false,
	props: {},
	setup() {
		const undoEnable = ref(false);

		const redoEnable = ref(false);

		let history: IPublicModelHistory | null = null;

		let changeDocumentDispose: IPublicTypeDisposable | undefined;

		let changeStateDispose: IPublicTypeDisposable | undefined;

		const updateState = (state: number) => {
			undoEnable.value = !!(state & 1);
			redoEnable.value = !!(state & 2);
		};

		const init = () => {
			changeDocumentDispose = project.onChangeDocument((doc) => {
				history = doc.history;
				updateState(history?.getState() || 0);
				changeStateDispose?.();
				changeStateDispose = history.onChangeState(() => {
					updateState(history?.getState() || 0);
				});
			});
		};

		onMounted(() => {
			init();
		});

		onUnmounted(() => {
			changeDocumentDispose?.();
			changeStateDispose?.();
		});

		const handleUndoClick = (): void => {
			history?.back();
		};

		const handleRedoClick = (): void => {
			history?.forward();
		};

		return () => (
			<Space>
				<Button
					type="text"
					icon={<UndoIcon style={{ opacity: 0.5 }} />}
					size="small"
					data-tip={`撤销 ${navigator.platform.toLowerCase().includes('mac') ? 'cmd' : 'ctrl'} + z`}
					disabled={!undoEnable.value}
					onClick={handleUndoClick}
				/>
				<Button
					type="text"
					icon={<RedoIcon style={{ opacity: 0.5 }} />}
					size="small"
					data-tip={`重做 ${navigator.platform.toLowerCase().includes('mac') ? 'cmd' : 'ctrl'} + y`}
					disabled={!redoEnable.value}
					onClick={handleRedoClick}
				/>
			</Space>
		);
	},
});

const plugin = (ctx: IPublicModelPluginContext) => ({
	name: 'PluginUndoRedo',
	dep: [],
	init() {
		ctx.skeleton.add({
			area: 'toolbar',
			type: 'Widget',
			name: 'undoRedo',
			content: <UndoRedo></UndoRedo>,
			props: {
				align: 'right',
				width: 88,
			},
		});
	},
});
plugin.pluginName = 'PluginUndoRedo';

export default plugin;
