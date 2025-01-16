import {
	defineComponent,
	inject,
	onBeforeUnmount,
	onMounted,
	PropType,
	ref,
	toRaw,
} from 'vue';
import {
	Editor,
	engineConfig,
	globalContext,
	Title,
} from '@arvin-shu/microcode-editor-core';
import { Breadcrumb, TabPane, Tabs, BreadcrumbItem } from 'ant-design-vue';
import { INode, Node, SettingField } from '@arvin-shu/microcode-designer';
import { createIcon } from '@arvin-shu/microcode-utils';
import { RightOutlined } from '@ant-design/icons-vue';
import { SettingsMain } from './main';
import { intl } from '../../locale';
import { SkeletonKey } from '../../skeleton';
import { SettingPane } from './setting-pane';
import { StageBox } from '../stage-box';

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

		const skeleton = inject(SkeletonKey, null);

		const shouldIgnoreRoot = ref(false);

		async function setShouldIgnoreRoot() {
			const designMode = await globalContext.get('editor').get('designMode');
			shouldIgnoreRoot.value = designMode === 'live';
		}

		onMounted(() => {
			setShouldIgnoreRoot();

			const editor = props.engineEditor;

			editor?.eventBus.on('designer.selection.change', () => {
				if (!engineConfig.get('stayOnTheSameSettingTab', false)) {
					activeKey.value = '';
				}
			});
		});
		onBeforeUnmount(() => {
			main.purge();
		});

		const renderBreadcrumb = () => {
			const { settings, editor } = main;

			if (!settings) {
				return null;
			}
			if (settings.isMultiple) {
				return (
					<div className="mtc-settings-navigator">
						{createIcon(settings.componentMeta?.icon, {
							className: 'mtc-settings-navigator-icon',
						})}
						<div style={{ marginLeft: '5px' }}>
							<Title title={settings.componentMeta!.title} />
							<span> {settings.nodes.length}</span>
						</div>
					</div>
				);
			}

			const designer = editor.get('designer');
			const current = designer?.currentSelection?.getNodes()?.[0];
			let node: INode | null = toRaw(settings.first);
			const focusNode = node.document?.focusNode;

			const items = [];
			let l = 3;
			while (l-- > 0 && node) {
				const _node = node;
				if (shouldIgnoreRoot.value && node.isRoot()) {
					break;
				}

				if (focusNode && node.contains(focusNode)) {
					l = 0;
				}

				const props =
					l === 2
						? {}
						: {
								onMouseenter: () => {
									hoverNode(_node as Node, true);
								},
								onMouseleave: () => {
									hoverNode(_node as Node, false);
								},
								onClick: () => {
									if (!_node) {
										return;
									}
									selectNode(_node as any);
									const getName = (node: any) => {
										const npm = node?.componentMeta?.npm;
										return (
											[npm?.package, npm?.componentName]
												.filter((item) => !!item)
												.join('-') ||
											node?.componentMeta?.componentName ||
											''
										);
									};
									const selected = getName(current);
									const target = getName(_node);
									editor?.eventBus.emit('skeleton.settingsPane.Breadcrumb', {
										selected,
										target,
									});
								},
							};

				const title = node?.title || '';
				items.unshift(
					<BreadcrumbItem {...props} key={node.id}>
						<Title title={title} />
					</BreadcrumbItem>
				);
				node = toRaw(node.parent);
			}

			return (
				<div className="mtc-settings-navigator">
					{createIcon(main.componentMeta?.icon, {
						class: 'mtc-settings-navigator-icon',
					})}
					<Breadcrumb
						separator={<RightOutlined />}
						className="mtc-settings-node-breadcrumb"
					>
						{items}
					</Breadcrumb>
				</div>
			);
		};

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

			let matched = false;

			const tabs = (items as SettingField[]).map((f) => {
				const field = toRaw(f);
				if (activeKey.value === field.name) {
					matched = true;
				}
				return (
					<TabPane key={field.name}>
						{{
							default: () => {
								if (skeleton) {
									return (
										<StageBox
											skeleton={skeleton}
											target={field}
											key={field.id}
											children={
												<SettingPane
													key={field.id}
													target={field}
												></SettingPane>
											}
										></StageBox>
									);
								}
								return <></>;
							},
							tab: () => <Title title={field.title}></Title>,
						}}
					</TabPane>
				);
			});

			activeKey.value = matched
				? activeKey.value
				: toRaw(items[0] as SettingField).name;

			return (
				<div class={'mtc-settings-main'}>
					{renderBreadcrumb()}
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

export function hoverNode(node: Node, flag: boolean) {
	node.hover(flag);
}
function selectNode(node: Node) {
	node?.select();
}
