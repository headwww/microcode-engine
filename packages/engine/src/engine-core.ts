import {
	IMicroodePluginContextApiAssembler,
	MicrocodePluginManager,
	IMicrocodeContextPrivate,
	PluginPreference,
	Designer,
} from '@arvin/microcode-designer';
import {
	commonEvent,
	Editor,
	engineConfig,
	globalContext,
} from '@arvin/microcode-editor-core';
import {
	Skeleton as InnerSkeleton,
	Workbench,
} from '@arvin/microcode-editor-skeleton';
import {
	Config,
	Plugins,
	Event,
	Skeleton,
	Material,
	Canvas,
} from '@arvin/microcode-shell';
import { IPublicTypePluginMeta } from '@arvin/microcode-types';
import { Logger } from '@arvin/microcode-utils';
import { h } from 'vue';
import defaultPanelRegistry from './inner-plugins/default-panel-registry';

const editor = new Editor();

globalContext.register(editor, Editor);
globalContext.register(editor, 'editor');
globalContext.register({}, 'workspace');

const innerSkeleton = new InnerSkeleton(editor);
editor.set('skeleton' as any, innerSkeleton);

const designer = new Designer();
editor.set('designer', designer);

const skeleton = new Skeleton(innerSkeleton, 'any', false);

const material = new Material(editor);
editor.set('material', material);

const config = new Config(engineConfig);
const event = new Event(commonEvent, { prefix: 'common' });

const canvas = new Canvas(editor);

engineConfig.set('ENGINE_VERSION', '1.0.0');
const pluginContextApiAssembler: IMicroodePluginContextApiAssembler = {
	assembleApis(
		context: IMicrocodeContextPrivate,
		pluginName: string,
		meta: IPublicTypePluginMeta
	) {
		context.skeleton = new Skeleton(innerSkeleton, pluginName, false);
		context.plugins = plugins;
		context.config = config;
		context.material = material;
		context.canvas = canvas;
		const eventPrefix = meta?.eventPrefix || 'common';
		context.event = new Event(commonEvent, { prefix: eventPrefix });
		context.logger = new Logger({
			level: 'warn',
			bizName: `plugin:${pluginName}`,
		});
		editor.set('pluginContext', context);
	},
};

const innerPlugins = new MicrocodePluginManager(pluginContextApiAssembler);
const plugins: Plugins = new Plugins(innerPlugins).toProxy();

editor.set('innerPlugins', innerPlugins);
editor.set('plugins', plugins);

// TODO 先模拟环境
const defaultPanelRegistryPlugin = defaultPanelRegistry(editor);
await plugins.register(defaultPanelRegistryPlugin);

export async function init(pluginPreference?: PluginPreference) {
	await plugins.init(pluginPreference);
	// TODO 先模拟环境
	window.ArvinMicrocodeEngine = innerPlugins._getMicrocodePluginContext(
		{} as any
	);
}

const MicrocodeWorkbench = h(Workbench, {
	skeleton: innerSkeleton,
});

export { skeleton, plugins, config, event, material, MicrocodeWorkbench };
