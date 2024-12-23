import {
	IPublicModelEngineConfig,
	IPublicModelPreference,
	IPublicTypeDisposable,
} from '@arvin-shu/microcode-types';
import { IEngineConfig } from '@arvin-shu/microcode-editor-core';
import { configSymbol } from '../symbols';

export class Config implements IPublicModelEngineConfig {
	private readonly [configSymbol]: IEngineConfig;

	constructor(innerEngineConfig: IEngineConfig) {
		this[configSymbol] = innerEngineConfig;
	}

	has(key: string): boolean {
		return this[configSymbol].has(key);
	}

	get(key: string, defaultValue?: any): any {
		return this[configSymbol].get(key, defaultValue);
	}

	set(key: string, value: any): void {
		this[configSymbol].set(key, value);
	}

	setConfig(config: { [key: string]: any }): void {
		this[configSymbol].setConfig(config);
	}

	onceGot(key: string): Promise<any> {
		return this[configSymbol].onceGot(key);
	}

	onGot(key: string, fn: (data: any) => void): IPublicTypeDisposable {
		return this[configSymbol].onGot(key, fn);
	}

	getPreference(): IPublicModelPreference {
		return this[configSymbol].getPreference();
	}
}
