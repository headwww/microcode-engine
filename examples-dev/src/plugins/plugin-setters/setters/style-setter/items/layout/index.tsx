import { computed, defineComponent, Fragment, PropType } from 'vue';
import { Row } from '../../components';
import { layoutConfig } from './locale';
import { StyleData } from '../../types';
import Box from './box';

export default defineComponent({
	name: 'LayoutSetter',
	inheritAttrs: false,
	props: {
		styleData: {
			type: Object as PropType<StyleData | any>,
			default: () => ({}),
		},
		showDisPlayList: {
			type: Array as PropType<string[]>,
			default: () => ['inline', 'flex', 'block', 'inline-block', 'none'],
		},
		onStyleChange: {
			type: Function as PropType<(style: StyleData[]) => void>,
			default: () => {},
		},
		unit: {
			type: String as PropType<string>,
			default: 'px',
		},
	},
	setup(props) {
		const { display, flexDirection, justifyContent, alignItems, flexWrap } =
			layoutConfig;

		const displayDataList = computed(() =>
			display.dataList.filter(
				(item: any) => props.showDisPlayList.indexOf(item.value) >= 0
			)
		);

		const transformStyle = computed(() => {
			const direction = props.styleData.flexDirection;
			if (direction === 'row') {
				return {};
			}
			if (direction === 'row-reverse') {
				return { transform: 'scaleX(-1)', transformOrigin: 'center' };
			}
			if (direction === 'column-reverse') {
				return {
					transform: 'scaleY(-1) rotate(90deg)',
					transformOrigin: 'center',
				};
			}
			if (direction === 'column') {
				return {
					transform: 'scaleY(1) rotate(90deg)',
					transformOrigin: 'center',
				};
			}
			return {};
		});

		return () => (
			<div class="layout-setter">
				<Box
					onStyleChange={props.onStyleChange}
					styleData={props.styleData}
					unit={props.unit}
				/>
				<Row
					styleKey="display"
					title={display.title}
					items={displayDataList.value}
					longTitle={true}
					{...props}
				/>
				{props.styleData.display === 'flex' && (
					<Fragment>
						<Row
							styleKey="flexDirection"
							title={flexDirection.title}
							items={flexDirection.dataList}
							longTitle={true}
							{...props}
						/>

						<Row
							styleKey="justifyContent"
							title={justifyContent.title}
							items={justifyContent.dataList}
							longTitle={true}
							transformStyle={transformStyle.value}
							{...props}
						/>

						<Row
							styleKey="alignItems"
							title={alignItems.title}
							items={alignItems.dataList}
							longTitle={true}
							transformStyle={transformStyle.value}
							{...props}
						/>

						<Row
							styleKey="flexWrap"
							title={flexWrap.title}
							items={flexWrap.dataList}
							longTitle={true}
							{...props}
						/>
					</Fragment>
				)}
			</div>
		);
	},
});
