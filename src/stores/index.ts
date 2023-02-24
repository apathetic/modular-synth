import { createPinia } from 'pinia';

export function createStore(app) {
	const pinia = createPinia();

	app.use(pinia);
};
