import {
	defineComponent,
	onMounted,
	PropType,
	ref,
	toRaw,
	Fragment,
} from 'vue';
import { globalLocale, Title } from '@arvin-shu/microcode-editor-core';
import { isI18nData } from '@arvin-shu/microcode-utils';
import { BuiltinSimulatorHost } from '../host';
import { INode } from '../../document';

export const BorderContainerInstance = defineComponent({
	props: {
		title: {
			type: String,
			require: true,
		},
		rect: {
			type: Object as PropType<DOMRect>,
		},
		scale: {
			type: Number,
			require: true,
			default: 1,
		},
		scrollX: {
			type: Number,
			require: true,
		},
		scrollY: {
			type: Number,
			require: true,
		},
	},
	setup(props) {
		return () => {
			const { title, rect, scale, scrollX, scrollY } = props;
			if (!rect) {
				return null;
			}

			const style = {
				width: `${rect.width * scale}px`,
				height: `${rect.height * scale}px`,
				transform: `translate(${(scrollX! + rect.left) * scale}px, ${(scrollY! + rect.top) * scale}px)`,
			};

			return (
				<div class="mtc-borders mtc-borders-detecting" style={style}>
					<Title title={title} className="mtc-borders-title" />
				</div>
			);
		};
	},
});

export const BorderContainer = defineComponent({
	name: 'BorderContainer',
	props: {
		host: {
			type: Object as PropType<BuiltinSimulatorHost>,
			require: true,
		},
	},
	setup(props) {
		const target = ref<INode>();

		onMounted(() => {
			const { host } = props;

			host?.designer.editor.eventBus.on(
				'designer.dropLocation.change',
				(loc: any) => {
					if (toRaw(target.value) === loc?.target) return;
					target.value = loc?.target;
				}
			);
		});

		return () => {
			const { host } = props;

			if (!target.value) {
				return null;
			}

			const instances = host?.getComponentInstances(target.value!);
			if (!instances || instances.length < 1) {
				return null;
			}

			if (instances.length === 1) {
				return (
					<BorderContainerInstance
						key="line-h"
						title={getTitle(toRaw(target.value)?.componentMeta.title)}
						scale={props.host?.viewport.scale}
						scrollX={props.host?.viewport.scrollX}
						scrollY={props.host?.viewport.scrollY}
						rect={
							host?.computeComponentInstanceRect(
								instances[0],
								toRaw(target.value)?.componentMeta.rootSelector
							)!
						}
					/>
				);
			}

			return (
				<Fragment>
					{instances.map((inst, i) => (
						<BorderContainerInstance
							key={`line-h-${i}`}
							title={getTitle(toRaw(target.value)?.componentMeta.title)}
							scale={props.host?.viewport.scale}
							scrollX={props.host?.viewport.scrollX}
							scrollY={props.host?.viewport.scrollY}
							rect={
								host?.computeComponentInstanceRect(
									instances[0],
									toRaw(target.value)?.componentMeta.rootSelector
								)!
							}
						/>
					))}
				</Fragment>
			);
		};
	},
});

function getTitle(title: any) {
	if (typeof title === 'string') return title;
	if (isI18nData(title)) {
		const locale = globalLocale.getLocale() || 'zh-CN';
		return `将放入到此${title[locale]}`;
	}
	return '';
}
