import { IPublicModelPluginInstance } from '@arvin/microcode-types';
import { IMicrocodePluginRuntime } from '@arvin/microcode-designer';
import { pluginInstanceSymbol } from '../symbols';

export class PluginInstance implements IPublicModelPluginInstance {
	private readonly [pluginInstanceSymbol]: IMicrocodePluginRuntime;

	constructor(pluginInstance: IMicrocodePluginRuntime) {
		this[pluginInstanceSymbol] = pluginInstance;
	}

	get pluginName(): string {
		return this[pluginInstanceSymbol].name;
	}

	get dep(): string[] {
		return this[pluginInstanceSymbol].dep;
	}

	get disabled(): boolean {
		return this[pluginInstanceSymbol].disabled;
	}

	set disabled(disabled: boolean) {
		this[pluginInstanceSymbol].setDisabled(disabled);
	}

	get meta() {
		return this[pluginInstanceSymbol].meta;
	}
}
