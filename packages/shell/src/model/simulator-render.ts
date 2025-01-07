import { IPublicModelSimulatorRender } from '@arvin-shu/microcode-types';
import { BuiltinSimulatorRenderer } from '@arvin-shu/microcode-designer';
import { simulatorRenderSymbol } from '../symbols';

export class SimulatorRender implements IPublicModelSimulatorRender {
	private readonly [simulatorRenderSymbol]: BuiltinSimulatorRenderer;

	constructor(simulatorRender: BuiltinSimulatorRenderer) {
		this[simulatorRenderSymbol] = simulatorRender;
	}

	static create(
		simulatorRender: BuiltinSimulatorRenderer
	): IPublicModelSimulatorRender {
		return new SimulatorRender(simulatorRender);
	}

	get components() {
		return this[simulatorRenderSymbol].components;
	}

	rerender() {
		return this[simulatorRenderSymbol].rerender();
	}
}
