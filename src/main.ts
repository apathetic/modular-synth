import { createApp } from 'vue';
import { context } from '@/audio';
import { createStore } from '@/stores';
import { registerComponents, registerServiceWorker } from '@/utils/register';
import Synth from './App.vue';
import '@/styles/styles.scss';
import type { App } from 'vue';


const app: App = createApp(Synth);

createStore(app);
registerComponents(app);
// registerServiceWorker();

app.provide('context', context);
app.mount('body');
