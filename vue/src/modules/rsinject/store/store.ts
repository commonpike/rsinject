import RSInject from '../module/RSInject';
import { ActionTree } from 'vuex';
import { Router } from 'vue-router';

interface RSIState {
    loaded: boolean,
    error: boolean,
    enabled: boolean
}

export default {
    namespaced: true,
    state: {
        loaded: false,
        error: false,
        enabled: false
    },
    getters: {
        loaded(state: RSIState): boolean {
            return state.loaded
        },
        error(state: RSIState): boolean {
            return state.error
        },
        enabled(state: RSIState): boolean {
            return state.enabled
        }
    },
    mutations: {
        loaded(state:RSIState, status: boolean) {
            state.loaded = status;
        },
        error(state:RSIState, status: boolean) {
            state.error = status;
        },
        enabled(state:RSIState, status: boolean) {
            state.enabled = status;
        }
    },
    actions: {
        init({state},router: Router) {
            RSInject.init();
            router.beforeEach(() => {
                if (RSInject.playing) {
                    RSInject.stop()
                }
            });
        },
        load({commit}) {
            commit('error',false);
            RSInject.load().then(()=>{
                commit('loaded',RSInject.loaded);
                commit('enabled',RSInject.enabled);
            }).catch(e=> {
                commit('error',true);
            });
        },
        update() {
            RSInject.update()
        },
        enable({commit}) {
            RSInject.enable();
            commit('enabled',RSInject.enabled);
        },
        disable({commit}) {
            RSInject.disable();
            commit('enabled',RSInject.enabled);
        },
        play() {
            RSInject.play();
        },
        pause() {
            RSInject.pause();
        },
        stop() {
            RSInject.stop();
        }
    } as ActionTree<RSIState, any>
}
