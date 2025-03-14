import {
	IMicroodePluginContextApiAssembler,
	MicrocodePluginManager,
	IMicrocodeContextPrivate,
	PluginPreference,
	Designer,
} from '@arvin-shu/microcode-designer';
import {
	commonEvent,
	Editor,
	engineConfig,
	globalContext,
	Setters as InnerSetters,
	Hotkey as InnerHotkey,
} from '@arvin-shu/microcode-editor-core';
import {
	Skeleton as InnerSkeleton,
	registerBuiltinTransducer,
	Workbench,
} from '@arvin-shu/microcode-editor-skeleton';
import {
	Config,
	Plugins,
	Event,
	Skeleton,
	Material,
	Canvas,
	Project,
	Hotkey,
	Setters,
} from '@arvin-shu/microcode-shell';
import {
	IPublicTypeEngineOptions,
	IPublicTypePluginMeta,
} from '@arvin-shu/microcode-types';
import { Logger } from '@arvin-shu/microcode-utils';
import { h } from 'vue';
import { defaultPanelRegistry } from './inner-plugins/default-panel-registry';
import { componentMetaParser } from './inner-plugins/component-meta-parser';
import { shellModelFactory } from './modules/shell-model-factory';
import { builtinHotkey } from './inner-plugins/builtin-hotkey';
import './modules/live-editing';

const editor = new Editor();

globalContext.register(editor, Editor);
globalContext.register(editor, 'editor');
globalContext.register({}, 'workspace');

const innerSkeleton = new InnerSkeleton(editor);
editor.set('skeleton' as any, innerSkeleton);

// @ts-ignore
const designer = new Designer({ editor, shellModelFactory });
editor.set('designer', designer);

const { project: innerProject } = designer;

const innerHotkey = new InnerHotkey();
const hotkey = new Hotkey(innerHotkey);
const project = new Project(innerProject);

const skeleton = new Skeleton(innerSkeleton, 'any', false);
const innerSetters = new InnerSetters();
const setters = new Setters(innerSetters);

const material = new Material(editor);

editor.set('project', project);
editor.set('setters', setters);
editor.set('material', material);
editor.set('innerHotkey', innerHotkey);

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
		context.hotkey = hotkey;
		context.skeleton = new Skeleton(innerSkeleton, pluginName, false);
		context.plugins = plugins;
		context.setters = setters;
		context.config = config;
		context.material = material;
		context.canvas = canvas;
		context.project = project;
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
const componentMetaParserPlugin = componentMetaParser(designer);
async function registryInnerPlugin() {
	await plugins.register(defaultPanelRegistryPlugin);
	await plugins.register(componentMetaParserPlugin);
	await plugins.register(registerBuiltinTransducer, {}, { autoInit: true });
	await plugins.register(builtinHotkey);

	return () => {
		plugins.delete(componentMetaParserPlugin.pluginName);
		plugins.delete(defaultPanelRegistryPlugin.pluginName);
		plugins.delete(builtinHotkey.pluginName);
		plugins.delete(defaultPanelRegistryPlugin.pluginName);
	};
}

// TODO 设置一个渲染模拟器插件
editor.set(
	'simulatorUrl',
	'https://cdn.jsdelivr.net/npm/@arvin-shu/microcode-vue-simulator-renderer@1.0.3/dist/js/index.min.js'
);

export async function init(
	pluginPreference?: PluginPreference,
	options?: IPublicTypeEngineOptions
) {
	await plugins.init(pluginPreference);

	engineConfig.setEngineOptions(options as any);

	// TODO 先模拟环境 后期如果engine-core打包成umd，则需要将此代码注释掉
	window.ArvinMicrocodeEngine = innerPlugins._getMicrocodePluginContext(
		{} as any
	);
}

const MicrocodeWorkbench = h(Workbench, {
	skeleton: innerSkeleton,
});

export {
	skeleton,
	plugins,
	config,
	event,
	hotkey,
	setters,
	project,
	material,
	MicrocodeWorkbench,
	// TODO 先模拟环境 这块需要考虑内置插件和外部插件的加载顺序
	registryInnerPlugin,
};
