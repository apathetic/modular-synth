import { createApp } from 'vue';
import { context } from '@/audio';
import { createStore } from '@/stores';
import { registerComponents } from '@/utils/register';
import Synth from './App.vue';
import '@/app.css';
import type { App } from 'vue';

const app: App = createApp(Synth);

createStore(app);
registerComponents(app);

app.provide('context', <AudioContext>context);
app.mount('body');
