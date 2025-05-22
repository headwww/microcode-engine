import { defineComponent } from 'vue';
import { VxeSplit, VxeSplitPane } from 'vxe-pc-ui';

export default defineComponent({
	name: 'LtSplit',
	props: {
		vertical: {
			type: Boolean,
			default: true,
		},
		border: {
			type: Boolean,
			default: false,
		},
		height: {
			type: [Number, String],
		},
		width: {
			type: [Number, String],
		},

		pane1Width: {
			type: [Number, String],
		},
		pane1MinWidth: {
			type: [Number, String],
		},
		pane1MaxWidth: {
			type: [Number, String],
		},
		pane1Height: {
			type: [Number, String],
		},
		pane1MinHeight: {
			type: [Number, String],
		},
		pane1MaxHeight: {
			type: [Number, String],
		},
		pane2Width: {
			type: [Number, String],
		},
		pane2MinWidth: {
			type: [Number, String],
		},
		pane2MaxWidth: {
			type: [Number, String],
		},
		pane2Height: {
			type: [Number, String],
		},

		pane2MinHeight: {
			type: [Number, String],
		},
		pane2MaxHeight: {
			type: [Number, String],
		},
	},
	setup(props, { slots }) {
		return () => (
			<VxeSplit
				vertical={props.vertical}
				border={props.border}
				height={props.height}
				width={props.width}
			>
				<VxeSplitPane
					width={props.pane1Width}
					height={props.pane1Height}
					minHeight={props.pane1MinHeight}
					maxHeight={props.pane1MaxHeight}
					minWidth={props.pane1MinWidth}
					maxWidth={props.pane1MaxWidth}
				>
					{{
						default: () => slots.pane1?.(),
					}}
				</VxeSplitPane>
				<VxeSplitPane
					width={props.pane2Width}
					height={props.pane2Height}
					minHeight={props.pane2MinHeight}
					maxHeight={props.pane2MaxHeight}
					minWidth={props.pane2MinWidth}
					maxWidth={props.pane2MaxWidth}
				>
					{{
						default: () => slots.pane2?.(),
					}}
				</VxeSplitPane>
			</VxeSplit>
		);
	},
});
