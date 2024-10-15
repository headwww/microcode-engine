import {
	IMicroodePluginContextApiAssembler,
	MicrocodePluginManager,
	IMicrocodeContextPrivate,
} from '@arvin/microcode-designer';
import { globalContext } from '@arvin/microcode-editor-core';
import { Plugins } from '@arvin/microcode-shell';

const pluginContextApiAssembler: IMicroodePluginContextApiAssembler = {
	assembleApis(context: IMicrocodeContextPrivate, pluginName: string) {
		context.plugins = plugins;
		pluginName;
	},
};

const innerPlugins = new MicrocodePluginManager(pluginContextApiAssembler);

const plugins: Plugins = new Plugins(innerPlugins);

export { plugins };

globalContext.register({}, 'workspace');
