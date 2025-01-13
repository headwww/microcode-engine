import {
	Designer,
	Node,
	Selection,
	SettingTopEntry,
} from '@arvin-shu/microcode-designer';
import { Editor } from '@arvin-shu/microcode-editor-core';
import { computed, ref } from 'vue';

function generateSessionId(nodes: Node[]) {
	return nodes
		.map((node) => node.id)
		.sort()
		.join(',');
}

export class SettingsMain {
	private _sessionId = '';

	private _settings = ref<SettingTopEntry>();

	private readonly computedSettings = computed(() => this._settings?.value);

	get settings() {
		return this.computedSettings.value;
	}

	private designer?: Designer;

	constructor(readonly editor: Editor) {
		this.init();
	}

	private init() {
		const setupSelection = (selection?: Selection) => {
			if (selection) {
				this.setup(selection.getNodes() as Node[]);
			} else {
				this.setup([]);
			}
		};

		this.editor.eventBus.on('designer.selection.change', setupSelection);
	}

	private setup(nodes: Node[]) {
		const sessionId = generateSessionId(nodes);
		if (sessionId === this._sessionId) {
			return;
		}
		this._sessionId = sessionId;

		if (nodes.length < 1) {
			this._settings.value = undefined;
			return;
		}

		if (!this.designer) {
			this.designer = nodes[0].document.designer as Designer;
		}
		// 当节点只有一个时，复用 node 上挂载的 settingEntry，不会产生平行的两个实例，这样在整个系统中对
		// 某个节点操作的 SettingTopEntry 只有一个实例，后续的 getProp() 也会拿到相同的 SettingField 实例
		if (nodes.length === 1) {
			this._settings.value = nodes[0].settingEntry as SettingTopEntry;
		} else {
			this._settings.value = this.designer.createSettingEntry(nodes);
		}
	}
}
