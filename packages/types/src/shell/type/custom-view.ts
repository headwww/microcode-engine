import { Component, VNode } from 'vue';

export type IPublicTypeCustomView<T = any> = VNode | Component<T>;
