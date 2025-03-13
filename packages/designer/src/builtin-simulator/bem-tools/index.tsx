import { defineComponent, PropType } from 'vue';
import { engineConfig } from '@arvin-shu/microcode-editor-core';
import { BuiltinSimulatorHost } from '../host';
import { BorderDetecting } from './border-detecting';
import { InsertionView } from './insertion';
import { BorderSelecting } from './border-selecting';
import { BorderContainer } from './border-container';

export const BemTools = defineComponent({
	props: {
		host: {
			type: Object as PropType<BuiltinSimulatorHost>,
			require: true,
		},
	},
	name: 'BemTools',
	setup(props) {
		return () => {
			const { host } = props;

			if (host?.designMode === 'live') {
				return null;
			}
			const { scrollX, scrollY, scale } = host!.viewport;

			return (
				<div
					class="mtc-bem-tools"
					style={{
						transform: `translate(${-scrollX * scale}px,${-scrollY * scale}px)`,
					}}
				>
					{!engineConfig.get('disableDetecting') && (
						<BorderDetecting key="hovering" host={host} />
					)}
					<BorderSelecting key="selecting" host={host} />
					{/* 将放到此容器提示 */}
					{engineConfig.get('enableReactiveContainer') && (
						<BorderContainer key="reactive-container-border" host={host} />
					)}
					<InsertionView key="insertion" host={host} />
					{host?.designer?.bemToolsManager?.getAllBemTools().map((tools) => {
						const ToolsCls = tools.item as any;
						return <ToolsCls key={tools.name} host={host} />;
					})}
				</div>
			);
		};
	},
});
