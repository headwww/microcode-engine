import microcode from './microcode';

const root = `http://${window.location.host}/scripts`;
export default {
	version: '1.0.0',
	packages: [
		{
			package: 'microcode-theme',
			version: '1.0.0',
			library: 'microcode-theme',
			urls: [`${root}/simulator/css/renderer.css`],
		},
		{
			package: 'lodash',
			library: '_',
			version: '4.6.1',
			urls: [`${root}/lodash/4.17.21/lodash.min.js`],
		},
		{
			package: 'dayjs',
			library: 'dayjs',
			version: '1.11.13',
			urls: [
				`${root}/dayjs/1.11.13/dayjs.min.js`,
				`${root}/dayjs/1.11.13/plugin/customParseFormat.js`,
				`${root}/dayjs/1.11.13/plugin/weekday.js`,
				`${root}/dayjs/1.11.13/plugin/localeData.js`,
				`${root}/dayjs/1.11.13/plugin/weekOfYear.js`,
				`${root}/dayjs/1.11.13/plugin/weekYear.js`,
				`${root}/dayjs/1.11.13/plugin/advancedFormat.js`,
				`${root}/dayjs/1.11.13/plugin/quarterOfYear.js`,
			],
		},
		{
			package: 'ArvinMicrocode',
			version: '1.0.0',
			library: 'ArvinMicrocode',
			urls: [
				{
					type: 'jsText',
					content: `
                   window.ArvinMicrocode = window.parent.ArvinMicrocode
                    `,
				},
			],
		},
		{
			package: 'antd',
			version: '4.2.6',
			urls: [
				`${root}/ant-design-vue/4.2.6/antd.min.js`,
				`${root}/ant-design-vue/4.2.6/reset.css`,
			],
			library: 'antd',
		},
		{
			package: 'xe-utils',
			library: 'XEUtils',
			version: '3.7.4',
			urls: [`${root}/xe-utils/3.7.4/xe-utils.umd.min.js`],
		},
		{
			package: 'VxeUi',
			library: 'VxeUI',
			version: '4.5.22',
			urls: [
				`${root}/vxe-ui/4.5.22/index.umd.min.js`,
				`${root}/vxe-ui/4.5.22/style.min.css`,
			],
		},

		{
			package: 'vxe-table',
			library: 'VxeUITable',
			version: '4.13.3',
			urls: [
				`${root}/vxe-table/4.13.3/vxe-table.min.js`,
				`${root}/vxe-table/4.13.3/style.css`,
			],
		},
		{
			package: 'dayjs-init',
			library: 'dayjs-init',
			version: '1.0.0',
			urls: [
				{
					type: 'jsText',
					content: `
                  if (window.dayjs_plugin_customParseFormat) {
                    dayjs.extend(window.dayjs_plugin_customParseFormat);
                  }
                  if (window.dayjs_plugin_weekday) {
                    dayjs.extend(window.dayjs_plugin_weekday);
                  }
                  if (window.dayjs_plugin_localeData) {
                    dayjs.extend(window.dayjs_plugin_localeData);
                  }
                  if (window.dayjs_plugin_weekOfYear) {
                    dayjs.extend(window.dayjs_plugin_weekOfYear);
                  }
                  if (window.dayjs_plugin_weekYear) {
                    dayjs.extend(window.dayjs_plugin_weekYear);
                  }
                  if (window.dayjs_plugin_advancedFormat) {
                    dayjs.extend(window.dayjs_plugin_advancedFormat);
                  }
                  if (window.dayjs_plugin_quarterOfYear) {
                    dayjs.extend(window.dayjs_plugin_quarterOfYear);
                  }
                `,
				},
			],
		},
	],
	components: [...microcode],
};
