import { createApp } from 'vue';
import { context } from '@/audio';
import { createStore } from '@/stores';
import { registerComponents, registerServiceWorker } from '@/utils/register';

import App from './App.vue';
import '@/styles/styles.scss';


const app = createApp(App);

createStore(app);
registerComponents(app);
// registerServiceWorker();

// const store = createStore();
// const router = createRouter();



// TODO inject at a module level...?
app.provide('context', context);
app.mount('body');
