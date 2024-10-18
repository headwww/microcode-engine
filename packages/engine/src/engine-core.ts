import {
	IMicroodePluginContextApiAssembler,
	MicrocodePluginManager,
	IMicrocodeContextPrivate,
	PluginPreference,
} from '@arvin/microcode-designer';
import {
	commonEvent,
	engineConfig,
	globalContext,
} from '@arvin/microcode-editor-core';
import { Config, Plugins, Event } from '@arvin/microcode-shell';
import { IPublicTypePluginMeta } from '@arvin/microcode-types';
import { Logger } from '@arvin/microcode-utils';

engineConfig.set('ENGINE_VERSION', '1.0.0');

const pluginContextApiAssembler: IMicroodePluginContextApiAssembler = {
	assembleApis(
		context: IMicrocodeContextPrivate,
		pluginName: string,
		meta: IPublicTypePluginMeta
	) {
		context.plugins = plugins;
		context.config = config;
		const eventPrefix = meta?.eventPrefix || 'common';
		context.event = new Event(commonEvent, { prefix: eventPrefix });
		context.logger = new Logger({
			level: 'warn',
			bizName: `plugin:${pluginName}`,
		});
	},
};

globalContext.register({}, 'workspace');

const config = new Config(engineConfig);

const innerPlugins = new MicrocodePluginManager(pluginContextApiAssembler);

const plugins: Plugins = new Plugins(innerPlugins).toProxy();

const event = new Event(commonEvent, { prefix: 'common' });

export async function init(pluginPreference?: PluginPreference) {
	await plugins.init(pluginPreference);
}

export { plugins, config, event };
