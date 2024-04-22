<template>
  <template v-if="loaded">
    <template v-if="enabled">
      <div id="rsi-wrapper">
        <div
          id="rsi-player"
          class="rs_addtools rs_splitbutton rs_preserve rs_skip rs_exp"
        ></div>
      </div>
    </template>
    <template v-else>
      <a
        class="rsi-enable-link"
        @click="enable"
        :title="dictionary.link_enable"
        >{{ dictionary.link_enable }}</a
      >
    </template>
  </template>
  <template v-else>
    <a class="rsi-load-link" @click="load" :title="dictionary.link_load">{{
      dictionary.link_load
    }}</a>
  </template>

  <div class="rsi-error" @click="closeErrorModal" v-if="errorVisible">
    <h3>{{ dictionary.error_title }}</h3>
    <p>{{ dictionary.error_text }}</p>
    <button @click="closeErrorModal">{{ dictionary.error_close }}</button>
  </div>
</template>

<script lang="ts">
import { useStore } from "vuex";
import { watch, ref, computed, nextTick } from "vue";
import RSInjectConfig from "../config.json";

export default {
  setup() {
    const store = useStore();

    const loaded = computed(() => store.getters["rsinject/loaded"]);
    const error = computed(() => store.getters["rsinject/error"]);
    const enabled = computed(() => store.getters["rsinject/enabled"]);
    const errorVisible = ref(false);

    watch(enabled, (value) => {
      if (value) {
        nextTick(() => {
          window.rspkr && window.rspkr.tools.toggler.add();
        });
      }
    });
    watch(error, (value) => {
      errorVisible.value = value;
    });

    function load() {
      store.dispatch("rsinject/load");
    }
    function enable() {
      store.dispatch("rsinject/enable");
    }
    function disable() {
      store.dispatch("rsinject/disable");
    }

    function closeErrorModal() {
      errorVisible.value = false;
    }

    return {
      loaded,
      errorVisible,
      enabled,
      load,
      enable,
      disable,
      closeErrorModal,
      dictionary: RSInjectConfig.dictionary,
    };
  },
};
</script>

<style lang="less">
@import "../less/rsinject.less";
</style>

<style lang="less" scoped>
#rsi-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
