import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import rsinject from './modules/rsinject/module';

// register the rsinject module
store.registerModule('rsinject', rsinject.store)
store.dispatch('rsinject/init', router, { root: true })

createApp(App).use(store).use(router).mount("#app");
