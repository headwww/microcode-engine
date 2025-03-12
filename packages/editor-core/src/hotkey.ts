import { isEqual } from 'lodash-es';
import {
	IPublicApiHotkey,
	IPublicTypeHotkeyCallback,
	IPublicTypeHotkeyCallbackConfig,
	IPublicTypeHotkeyCallbacks,
} from '@arvin-shu/microcode-types';
import { globalContext } from './di';

/**
 * 键盘按键映射接口,用于存储键码到按键名的映射
 */
interface KeyMap {
	[key: number]: string;
}

/**
 * Ctrl组合键映射接口
 */
interface CtrlKeyMap {
	[key: string]: string;
}

/**
 * 按键事件接口
 */
interface ActionEvent {
	type: string;
}

/**
 * 热键直接映射接口,用于存储组合键到回调函数的映射
 */
interface HotkeyDirectMap {
	[key: string]: IPublicTypeHotkeyCallback;
}

/**
 * 按键信息接口,包含按键、修饰键和动作类型
 */
interface KeyInfo {
	key: string;
	modifiers: string[];
	action: string;
}

/**
 * 按键序列等级接口
 */
interface SequenceLevels {
	[key: string]: number;
}

/**
 * 基础按键映射表,包含常用功能键的键码映射
 */
const MAP: KeyMap = {
	8: 'backspace',
	9: 'tab',
	13: 'enter',
	16: 'shift',
	17: 'ctrl',
	18: 'alt',
	20: 'capslock',
	27: 'esc',
	32: 'space',
	33: 'pageup',
	34: 'pagedown',
	35: 'end',
	36: 'home',
	37: 'left',
	38: 'up',
	39: 'right',
	40: 'down',
	45: 'ins',
	46: 'del',
	91: 'meta',
	93: 'meta',
	224: 'meta',
};

/**
 * 特殊字符键码映射表
 */
const KEYCODE_MAP: KeyMap = {
	106: '*',
	107: '+',
	109: '-',
	110: '.',
	111: '/',
	186: ';',
	187: '=',
	188: ',',
	189: '-',
	190: '.',
	191: '/',
	192: '`',
	219: '[',
	220: '\\',
	221: ']',
	222: "'",
};

/**
 * Shift组合键映射表,用于处理大写字符和特殊符号
 */
const SHIFT_MAP: CtrlKeyMap = {
	'~': '`',
	'!': '1',
	'@': '2',
	'#': '3',
	$: '4',
	'%': '5',
	'^': '6',
	'&': '7',
	'*': '8',
	'(': '9',
	')': '0',
	_: '-',
	'+': '=',
	':': ';',
	'"': "'",
	'<': ',',
	'>': '.',
	'?': '/',
	'|': '\\',
};

/**
 * 特殊按键别名映射表
 */
const SPECIAL_ALIASES: CtrlKeyMap = {
	option: 'alt',
	command: 'meta',
	return: 'enter',
	escape: 'esc',
	plus: '+',
	mod: /Mac|iPod|iPhone|iPad/.test(navigator.platform) ? 'meta' : 'ctrl',
};

let REVERSE_MAP: CtrlKeyMap;

/**
 * 添加F1-F19功能键到映射表
 */
for (let i = 1; i < 20; ++i) {
	MAP[111 + i] = `f${i}`;
}

/**
 * 添加数字键盘0-9的映射
 */
for (let i = 0; i <= 9; ++i) {
	MAP[i + 96] = String(i);
}

/**
 * 从键盘事件中获取按键字符
 * @param e 键盘事件对象
 * @returns 按键字符
 */
function characterFromEvent(e: KeyboardEvent): string {
	const keyCode = e.keyCode || e.which;
	// 对于keypress事件,直接返回字符
	if (e.type === 'keypress') {
		let character = String.fromCharCode(keyCode);
		// 如果没有按下shift键,则转换为小写
		if (!e.shiftKey) {
			character = character.toLowerCase();
		}
		return character;
	}
	// 对于非keypress事件,需要使用特殊映射表
	if (MAP[keyCode]) {
		return MAP[keyCode];
	}
	if (KEYCODE_MAP[keyCode]) {
		return KEYCODE_MAP[keyCode];
	}
	// 如果不在特殊映射表中,转换为小写字符返回
	return String.fromCharCode(keyCode).toLowerCase();
}

interface KeypressEvent extends KeyboardEvent {
	type: 'keypress';
}

/**
 * 判断是否为keypress事件
 */
function isPressEvent(e: KeyboardEvent | ActionEvent): e is KeypressEvent {
	return e.type === 'keypress';
}

/**
 * 检查两个修饰键数组是否相等
 */
function modifiersMatch(modifiers1: string[], modifiers2: string[]): boolean {
	return modifiers1.sort().join(',') === modifiers2.sort().join(',');
}

/**
 * 从键盘事件中获取按下的修饰键列表
 */
function eventModifiers(e: KeyboardEvent): string[] {
	const modifiers = [];

	if (e.shiftKey) {
		modifiers.push('shift');
	}

	if (e.altKey) {
		modifiers.push('alt');
	}

	if (e.ctrlKey) {
		modifiers.push('ctrl');
	}

	if (e.metaKey) {
		modifiers.push('meta');
	}

	return modifiers;
}

/**
 * 判断按键是否为修饰键
 */
function isModifier(key: string): boolean {
	return key === 'shift' || key === 'ctrl' || key === 'alt' || key === 'meta';
}

/**
 * 生成反向映射表,用于查找特定按键
 */
function getReverseMap(): CtrlKeyMap {
	if (!REVERSE_MAP) {
		REVERSE_MAP = {};
		for (const key in MAP) {
			// 排除数字键盘的按键
			if (Number(key) > 95 && Number(key) < 112) {
				continue;
			}

			if (MAP.hasOwnProperty(key)) {
				REVERSE_MAP[MAP[key]] = key;
			}
		}
	}
	return REVERSE_MAP;
}

/**
 * 根据按键组合选择最佳的事件类型
 */
function pickBestAction(
	key: string,
	modifiers: string[],
	action?: string
): string {
	// 如果没有指定action,根据按键选择合适的事件类型
	if (!action) {
		action = getReverseMap()[key] ? 'keydown' : 'keypress';
	}
	// 对于有修饰键的组合,使用keydown而不是keypress
	if (action === 'keypress' && modifiers.length) {
		action = 'keydown';
	}
	return action;
}

/**
 * 将组合键字符串转换为按键数组
 * @param combination 组合键字符串,如 "command+shift+l"
 */
function keysFromString(combination: string): string[] {
	if (combination === '+') {
		return ['+'];
	}

	combination = combination.replace(/\+{2}/g, '+plus');
	return combination.split('+');
}

/**
 * 获取组合键的详细信息
 * @param combination 组合键字符串
 * @param action 事件类型
 */
function getKeyInfo(combination: string, action?: string): KeyInfo {
	let keys: string[] = [];
	let key = '';
	let i: number;
	const modifiers: string[] = [];

	// 解析组合键字符串
	keys = keysFromString(combination);

	for (i = 0; i < keys.length; ++i) {
		key = keys[i];

		// 处理按键别名
		if (SPECIAL_ALIASES[key]) {
			key = SPECIAL_ALIASES[key];
		}

		// 处理shift组合键
		if (action && action !== 'keypress' && SHIFT_MAP[key]) {
			key = SHIFT_MAP[key];
			modifiers.push('shift');
		}

		// 如果是修饰键,添加到修饰键列表
		if (isModifier(key)) {
			modifiers.push(key);
		}
	}

	// 选择最佳的事件类型
	action = pickBestAction(key, modifiers, action);

	return {
		key,
		modifiers,
		action,
	};
}

/**
 * 执行回调函数
 * 如果回调返回false,则阻止事件默认行为和冒泡
 */
function fireCallback(
	callback: IPublicTypeHotkeyCallback,
	e: KeyboardEvent,
	combo?: string,
	sequence?: string
): void {
	try {
		const workspace = globalContext.get('workspace');
		const editor = workspace.isActive
			? workspace.window?.editor
			: globalContext.get('editor');
		const designer = editor?.get('designer');
		const node = designer?.currentSelection?.getNodes()?.[0];
		const npm = node?.componentMeta?.npm;
		const selected =
			[npm?.package, npm?.componentName].filter((item) => !!item).join('-') ||
			node?.componentMeta?.componentName ||
			'';
		if (callback(e, combo) === false) {
			e.preventDefault();
			e.stopPropagation();
		}
		editor?.eventBus.emit('hotkey.callback.call', {
			callback,
			e,
			combo,
			sequence,
			selected,
		});
	} catch (err: any) {
		// eslint-disable-next-line no-console
		console.error(err.message);
	}
}

export interface IHotKey extends Omit<IPublicApiHotkey, 'bind' | 'callbacks'> {
	activate(activate: boolean): void;
}

/**
 * 热键管理类
 */
export class Hotkey implements IHotKey {
	callBacks: IPublicTypeHotkeyCallbacks = {};

	private directMap: HotkeyDirectMap = {};

	private sequenceLevels: SequenceLevels = {};

	private resetTimer = 0;

	private ignoreNextKeyup: boolean | string = false;

	private ignoreNextKeypress = false;

	private nextExpectedAction: boolean | string = false;

	private isActivate = true;

	constructor(readonly viewName: string = 'global') {
		this.mount(window);
	}

	activate(activate: boolean): void {
		this.isActivate = activate;
	}

	mount(window: Window) {
		const { document } = window;
		const handleKeyEvent = this.handleKeyEvent.bind(this);
		document.addEventListener('keypress', handleKeyEvent, false);
		document.addEventListener('keydown', handleKeyEvent, false);
		document.addEventListener('keyup', handleKeyEvent, false);
		return () => {
			document.removeEventListener('keypress', handleKeyEvent, false);
			document.removeEventListener('keydown', handleKeyEvent, false);
			document.removeEventListener('keyup', handleKeyEvent, false);
		};
	}

	bind(
		combos: string[] | string,
		callback: IPublicTypeHotkeyCallback,
		action?: string
	): Hotkey {
		this.bindMultiple(
			Array.isArray(combos) ? combos : [combos],
			callback,
			action
		);
		return this;
	}

	unbind(
		combos: string[] | string,
		callback: IPublicTypeHotkeyCallback,
		action?: string
	) {
		const combinations = Array.isArray(combos) ? combos : [combos];

		combinations.forEach((combination) => {
			const info: KeyInfo = getKeyInfo(combination, action);
			const { key, modifiers } = info;
			const idx = this.callBacks[key].findIndex(
				(info) =>
					isEqual(info.modifiers, modifiers) && info.callback === callback
			);
			if (idx !== -1) {
				this.callBacks[key].splice(idx, 1);
			}
		});
	}

	/**
	 * 重置除指定序列外的所有序列计数器
	 */
	private resetSequences(doNotReset?: SequenceLevels): void {
		let activeSequences = false;
		let key = '';
		for (key in this.sequenceLevels) {
			if (doNotReset && doNotReset[key]) {
				activeSequences = true;
			} else {
				this.sequenceLevels[key] = 0;
			}
		}
		if (!activeSequences) {
			this.nextExpectedAction = false;
		}
	}

	/**
	 * 根据按键码、修饰键和事件类型查找匹配的回调函数
	 */
	private getMatches(
		character: string,
		modifiers: string[],
		e: KeyboardEvent | ActionEvent,
		sequenceName?: string,
		combination?: string,
		level?: number
	): IPublicTypeHotkeyCallbackConfig[] {
		let i: number;
		let callback: IPublicTypeHotkeyCallbackConfig;
		const matches: IPublicTypeHotkeyCallbackConfig[] = [];
		const action: string = e.type;

		if (!this.callBacks[character]) {
			return [];
		}

		if (action === 'keyup' && isModifier(character)) {
			modifiers = [character];
		}

		for (i = 0; i < this.callBacks[character].length; ++i) {
			callback = this.callBacks[character][i];

			if (
				!sequenceName &&
				callback.seq &&
				this.sequenceLevels[callback.seq] !== callback.level
			) {
				continue;
			}

			if (action !== callback.action) {
				continue;
			}

			if (
				(isPressEvent(e) && !e.metaKey && !e.ctrlKey) ||
				modifiersMatch(modifiers, callback.modifiers)
			) {
				const deleteCombo = !sequenceName && callback.combo === combination;
				const deleteSequence =
					sequenceName &&
					callback.seq === sequenceName &&
					callback.level === level;
				if (deleteCombo || deleteSequence) {
					this.callBacks[character].splice(i, 1);
				}

				matches.push(callback);
			}
		}
		return matches;
	}

	/**
	 * 处理按键事件
	 */
	private handleKey(
		character: string,
		modifiers: string[],
		e: KeyboardEvent
	): void {
		const callbacks: IPublicTypeHotkeyCallbackConfig[] = this.getMatches(
			character,
			modifiers,
			e
		);
		let i: number;
		const doNotReset: SequenceLevels = {};
		let maxLevel = 0;
		let processedSequenceCallback = false;

		// 计算序列的最大等级
		for (i = 0; i < callbacks.length; ++i) {
			if (callbacks[i].seq) {
				maxLevel = Math.max(maxLevel, callbacks[i].level || 0);
			}
		}

		for (i = 0; i < callbacks.length; ++i) {
			if (callbacks[i].seq) {
				if (callbacks[i].level !== maxLevel) {
					continue;
				}

				processedSequenceCallback = true;

				doNotReset[callbacks[i].seq || ''] = 1;
				fireCallback(
					callbacks[i].callback,
					e,
					callbacks[i].combo,
					callbacks[i].seq
				);
				continue;
			}

			if (!processedSequenceCallback) {
				fireCallback(callbacks[i].callback, e, callbacks[i].combo);
			}
		}

		const ignoreThisKeypress = e.type === 'keypress' && this.ignoreNextKeypress;
		if (
			e.type === this.nextExpectedAction &&
			!isModifier(character) &&
			!ignoreThisKeypress
		) {
			this.resetSequences(doNotReset);
		}

		this.ignoreNextKeypress = processedSequenceCallback && e.type === 'keydown';
	}

	/**
	 * 处理键盘事件
	 */
	private handleKeyEvent(e: KeyboardEvent): void {
		if (!this.isActivate) {
			return;
		}
		const character = characterFromEvent(e);

		if (!character) {
			return;
		}

		if (e.type === 'keyup' && this.ignoreNextKeyup === character) {
			this.ignoreNextKeyup = false;
			return;
		}

		this.handleKey(character, eventModifiers(e), e);
	}

	/**
	 * 重置序列计时器
	 */
	private resetSequenceTimer(): void {
		if (this.resetTimer) {
			clearTimeout(this.resetTimer);
		}
		this.resetTimer = window.setTimeout(this.resetSequences, 1000);
	}

	/**
	 * 绑定按键序列
	 */
	private bindSequence(
		combo: string,
		keys: string[],
		callback: IPublicTypeHotkeyCallback,
		action?: string
	): void {
		this.sequenceLevels[combo] = 0;
		const increaseSequence = (nextAction: string) => () => {
			this.nextExpectedAction = nextAction;
			++this.sequenceLevels[combo];
			this.resetSequenceTimer();
		};
		const callbackAndReset = (e: KeyboardEvent): void => {
			fireCallback(callback, e, combo);

			if (action !== 'keyup') {
				this.ignoreNextKeyup = characterFromEvent(e);
			}

			setTimeout(this.resetSequences, 10);
		};
		for (let i = 0; i < keys.length; ++i) {
			const isFinal = i + 1 === keys.length;
			const wrappedCallback = isFinal
				? callbackAndReset
				: increaseSequence(action || getKeyInfo(keys[i + 1]).action);
			this.bindSingle(keys[i], wrappedCallback, action, combo, i);
		}
	}

	/**
	 * 绑定单个按键组合
	 */
	private bindSingle(
		combination: string,
		callback: IPublicTypeHotkeyCallback,
		action?: string,
		sequenceName?: string,
		level?: number
	): void {
		this.directMap[`${combination}:${action}`] = callback;

		combination = combination.replace(/\s+/g, ' ');

		const sequence: string[] = combination.split(' ');

		if (sequence.length > 1) {
			this.bindSequence(combination, sequence, callback, action);
			return;
		}

		const info: KeyInfo = getKeyInfo(combination, action);

		this.callBacks[info.key] = this.callBacks[info.key] || [];

		this.getMatches(
			info.key,
			info.modifiers,
			{ type: info.action },
			sequenceName,
			combination,
			level
		);

		this.callBacks[info.key][sequenceName ? 'unshift' : 'push']({
			callback,
			modifiers: info.modifiers,
			action: info.action,
			seq: sequenceName,
			level,
			combo: combination,
		});
	}

	/**
	 * 绑定多个按键组合
	 */
	private bindMultiple(
		combinations: string[],
		callback: IPublicTypeHotkeyCallback,
		action?: string
	) {
		for (const item of combinations) {
			this.bindSingle(item, callback, action);
		}
	}
}
