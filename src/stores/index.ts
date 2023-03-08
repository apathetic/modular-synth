import { createPinia } from 'pinia';

export { useAppStore } from './app';

export function createStore(app) {
	const pinia = createPinia();

	app.use(pinia);
}
