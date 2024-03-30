<template>
  <p>
    <RSInject />
    <span v-if="!loaded">
      &lt;-- load and enable your readspeaker here 
    </span>
    <span v-else-if="!enabled">
      &lt;-- enable your readspeaker here 
    </span>
    <!-- optional goodies 
      <hr />
      <button id="load" @click="store.dispatch('rsinject/load')">Load the player</button>
      <button id="enable" @click="store.dispatch('rsinject/enable')">Enable the player</button>
      <button id="disable" @click="store.dispatch('rsinject/disable')">Disable the player</button>
      <button id="play" @click="store.dispatch('rsinject/play')">Play</button>
      <button id="pause" @click="store.dispatch('rsinject/pause')">Pause</button>
      <button id="stop" @click="store.dispatch('rsinject/stop')">Stop</button>
    -->

  </p>
  <hr />
  <nav>
    
    <router-link to="/">Home</router-link> |
    <router-link to="/about">About</router-link>
    
  </nav>
  <router-view />
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";
import RSInject from './modules/rsinject/components/RSInject.vue';
import store from "./store";

const loaded = computed(()=>store.getters['rsinject/loaded']);
const enabled = computed(()=>store.getters['rsinject/enabled']);

export default defineComponent({
  name: "AppView",
  components: {
    RSInject,
  },
  data() {
    return {
      store,
      loaded,
      enabled
    }
  }
});
</script>


<style lang="less">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}

/*
  // optional goodies 

    #load, #enable,#disable,#play,#pause,#stop {
      display:none;
    }

    body:not(.rsi-loaded) #load {
      display:inline;
    }

    body.rsi-loaded:not(.rsi-enabled) #enable {
      display:inline;
    }

    body.rsi-enabled #play,
    body.rsi-enabled #pause,
    body.rsi-enabled #stop,
    body.rsi-enabled #disable {
      display:inline;
    }
*/

</style>
