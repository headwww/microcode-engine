import { computed, ref, Ref } from 'vue';
import { Logger } from '@arvin-shu/microcode-utils';
import { createModuleEventBus, IEventBus } from '../event-bus';

const languageMap: { [key: string]: string } = {
	en: 'en-US',
	zh: 'zh-CN',
	zt: 'zh-TW',
	es: 'es-ES',
	pt: 'pt-PT',
	fr: 'fr-FR',
	de: 'de-DE',
	it: 'it-IT',
	ru: 'ru-RU',
	ja: 'ja-JP',
	ko: 'ko-KR',
	ar: 'ar-SA',
	tr: 'tr-TR',
	th: 'th-TH',
	vi: 'vi-VN',
	nl: 'nl-NL',
	he: 'iw-IL',
	id: 'in-ID',
	pl: 'pl-PL',
	hi: 'hi-IN',
	uk: 'uk-UA',
	ms: 'ms-MY',
	tl: 'tl-PH',
};

const logger = new Logger({ level: 'warn', bizName: 'globalLocale' });

const MicrocodeConfigKey = 'arvin-microcode-config';

/**
 * 全局国际化标准
 */
class GlobalLocale {
	private emitter: IEventBus = createModuleEventBus('GlobalLocale');

	private _locale: Ref<string | undefined> = ref('');

	locale = computed(() => {
		if (this._locale.value != null) {
			return this._locale.value;
		}
		// store 1: 从 localStorage 中获取配置
		let result = null;
		if (hasLocalStorage(window)) {
			const store = window.localStorage;
			let config: any;
			try {
				config = JSON.parse(store.getItem(MicrocodeConfigKey) || '');
			} catch (e) {
				logger.error(`get locale:${e}`);
			}
			if (config?.locale) {
				result = (config.locale || '').replace('_', '-');
				logger.debug(`getting locale from localStorage: ${result}`);
			}
		}

		// store 2: 从 window 配置中获取
		if (!result) {
			const localeFromConfig: string = getConfig('locale');
			if (localeFromConfig) {
				result =
					languageMap[localeFromConfig] || localeFromConfig.replace('_', '-');
				logger.debug(`getting locale from config: ${result}`);
			}
		}
		// store 3: 从系统语言获取
		if (!result) {
			const { navigator } = window as any;
			if (navigator.language) {
				const lang = navigator.language as string;
				return languageMap[lang] || lang.replace('_', '-');
			}
			if (navigator.browserLanguage) {
				const it = navigator.browserLanguage.split('-');
				let localeFromSystem = it[0];
				if (it[1]) {
					localeFromSystem += `-${it[1].toUpperCase()}`;
				}
				result = localeFromSystem;
				logger.debug(`getting locale from system: ${result}`);
			}
		}
		// 默认值
		if (!result) {
			logger.warn(
				'something went wrong when trying to get locale, use zh-CN as default, please check it out!'
			);
			result = 'zh-CN';
		}

		this._locale.value = result;
		return result;
	});

	constructor() {
		this.emitter.setMaxListeners(0);
	}

	setLocale(locale: string) {
		logger.info(`setting locale to ${locale}`);
		if (locale === this.locale.value) {
			return;
		}
		this._locale.value = locale;
		if (hasLocalStorage(window)) {
			const store = window.localStorage;
			let config: any;
			try {
				config = JSON.parse(store.getItem(MicrocodeConfigKey) || '');
			} catch (e) {
				logger.error(`set locale:${e}`);
			}
			if (config && typeof config === 'object') {
				config.locale = locale;
			} else {
				config = { locale };
			}
			store.setItem(MicrocodeConfigKey, JSON.stringify(config));
		}
		this.emitter.emit('localechange', locale);
	}

	getLocale() {
		return this.locale.value;
	}

	onChangeLocale(fn: (locale: string) => void): () => void {
		this.emitter.on('localechange', fn);
		return () => {
			this.emitter.removeListener('localechange', fn);
		};
	}
}

function hasLocalStorage(obj: any): obj is WindowLocalStorage {
	return obj.localStorage;
}

function getConfig(name: string) {
	const win: any = window;
	return (
		win[name] || (win.g_config || {})[name] || (win.pageConfig || {})[name]
	);
}

const globalLocale = new GlobalLocale();

export { globalLocale };
