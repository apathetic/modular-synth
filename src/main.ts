import { createApp } from 'vue';
import { context } from '@/audio';
import { createStore } from '@/stores';
import { registerComponents, registerServiceWorker } from '@/utils/register';
import App from './App.vue';
import '@/styles/styles.scss';
import type { App as Application } from 'vue';


const app: Application = createApp(App);

createStore(app);
registerComponents(app);
// registerServiceWorker();

app.provide('context', context);
app.mount('body');
