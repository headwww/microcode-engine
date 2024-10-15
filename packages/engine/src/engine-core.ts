import {
	IMicroodePluginContextApiAssembler,
	MicrocodePluginManager,
	IMicrocodeContextPrivate,
} from '@arvin/microcode-designer';
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
