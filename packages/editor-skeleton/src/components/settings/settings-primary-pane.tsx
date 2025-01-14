import {
	defineComponent,
	inject,
	onBeforeUnmount,
	PropType,
	ref,
	toRaw,
} from 'vue';
import { Editor, engineConfig, Title } from '@arvin-shu/microcode-editor-core';
import { TabPane, Tabs } from 'ant-design-vue';
import { SettingField } from '@arvin-shu/microcode-designer';
import { SettingsMain } from './main';
import { intl } from '../../locale';
import { SkeletonKey } from '../../skeleton';
import { SettingPane } from './setting-pane';

export const SettingsPrimaryPane = defineComponent({
	name: 'SettingsPrimaryPane',
	inheritAttrs: false,
	props: {
		engineEditor: Object as PropType<Editor>,
	},
	setup(props) {
		const main = new SettingsMain(props.engineEditor!);

		const renderNotice = (message: string) => (
			<div className="mtc-settings-main">
				<div className="mtc-settings-notice">
					<p>{intl(message)}</p>
				</div>
			</div>
		);

		const activeKey = ref();

		const skeleton = inject(SkeletonKey);
		skeleton;

		onBeforeUnmount(() => {
			main.purge();
		});

		return () => {
			const { settings } = main;
			if (!settings) {
				return renderNotice('Please select a node in canvas');
			}
			if (
				settings.isLocked &&
				!engineConfig.get('enableLockedNodeSetting', false)
			) {
				return renderNotice('Current node is locked');
			}

			if (Array.isArray(settings.items) && settings.items.length === 0) {
				return renderNotice('No config found for this type of component');
			}

			if (!settings.isSameComponent) {
				return renderNotice('Please select same kind of components');
			}

			const { items } = settings;

			// TODO items.length > 5

			let matched = false;

			const tabs = (items as SettingField[]).map((f) => {
				const field = toRaw(f);
				if (activeKey.value === field.name) {
					matched = true;
				}
				return (
					<TabPane key={field.name}>
						{{
							default: () => <SettingPane target={field}></SettingPane>,
							tab: () => <Title title={field.title}></Title>,
						}}
					</TabPane>
				);
			});

			activeKey.value = matched
				? activeKey.value
				: (items[0] as SettingField).name;

			return (
				<div class={'mtc-settings-main'}>
					<div style="height: 30px">nav</div>
					<Tabs
						prefixCls="mtc-settings-tabs"
						activeKey={activeKey.value}
						onChange={(key) => {
							activeKey.value = key;
						}}
					>
						{tabs}
					</Tabs>
				</div>
			);
		};
	},
});
