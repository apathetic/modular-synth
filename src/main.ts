import { createApp } from 'vue';
import App from './App.vue';
// import store from './stores';
// import router from './router';
// import CompositionAPI from '@vue/composition-api';
// import { auth } from './stores/firebase';
import { context } from '@/audio';
import { createStore } from '@/stores';
import { registerComponents, registerServiceWorker } from '@/utils/register';
import '@/styles/styles.scss';


const app = createApp(App);

createStore(app);
registerComponents(app);
registerServiceWorker();

// const store = createStore();
// const router = createRouter();



// TODO inject at a module level...?
app.provide('context', context);
app.mount('body');
