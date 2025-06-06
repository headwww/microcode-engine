import { ILoggerOptions, IPublicApiLogger } from '@arvin-shu/microcode-types';
import { getLogger } from '@arvin-shu/microcode-utils';

const innerLoggerSymbol = Symbol('logger');

export class Logger implements IPublicApiLogger {
	private readonly [innerLoggerSymbol]: any;

	constructor(options: ILoggerOptions) {
		this[innerLoggerSymbol] = getLogger(options as any);
	}

	/**
	 * debug info
	 */
	debug(...args: any | any[]): void {
		this[innerLoggerSymbol].debug(...args);
	}

	/**
	 * normal info output
	 */
	info(...args: any | any[]): void {
		this[innerLoggerSymbol].info(...args);
	}

	/**
	 * warning info output
	 */
	warn(...args: any | any[]): void {
		this[innerLoggerSymbol].warn(...args);
	}

	/**
	 * error info output
	 */
	error(...args: any | any[]): void {
		this[innerLoggerSymbol].error(...args);
	}

	/**
	 * normal log output
	 */
	log(...args: any | any[]): void {
		this[innerLoggerSymbol].log(...args);
	}
}
