# ReadSpeakerPlayer for Vue

This Vue module allows you to add ReadSpeaker (readspeaker.com)
to your Vue app without modifying your Vue templates or much
of the app.

This is not a NPM module. You need to manually 
copy the module code to your app.

RSInject needs to be `init`ed, `load`ed and 
`enable`d before it does anything; in that order. 
The included .vue component will do these things 
for you; read more below.

The module defines the concept of `Zones`, which
contain metadata about speakable areas in your app. 
Each zone can specify (oa) multiple (css) queryselectors 
to read from and one (css) queryselector to inject a speaker
link in.

If all that is done, on every DOM change, the DOM will be 
reinspected and if RSInject finds new zones, the zone will be 
prepared and speaker buttons injected according 
to your config.


## Setup

### src/modules/rsinject

Copy the module folder to `src/modules/rsinject`
Copy the contents of `src/modules/rsinject/public` to `public`

#### Edit the config.json 
It contains the `window.rsConf` that ReadSpeaker wants,
plus extra settings for RSInject, including the `zones`.

Zones are areas to read within your app. For each zone you can configure
 - `zone_selector` : the container for a zone
 - `read_selectors` : what to read inside the zone
 - `speaker_selector` : where to place the speaker button inside the zone
 - `speaker_position` : where to insert the speaker in the speaker_selector (before,after or none)
 - `speaker_class` : optional, css class to add the speaker of this zone
 - `skip_selectors` : what elements to `rs_skip` inside the zone
 - `noaria_selectors` : where to remove aria-label inside the zone
 - `greedy` : optional, false by default. When rsinject has initialized a zone, it will not re-evaluate that zone even if there are changes on the page, to save CPU. Set to true to always evaluate the contents of a zone, even if it has been evaluated before. 


#### Finetune RSInject.vue  

The component contains the (split) player.
It also loads the global css for styling, oa,
the speaker links throughout the app. Edit to your likings.


#### Finetune css

Edit settings for your site in rsinject.less.
It also contains a custom skin in skin.less. 

### main.js

register and init the module:
```
import rsinject from './modules/rsinject/module'
Store.registerModule('rsinject', rsinject.store)
Store.dispatch('rsinject/init', router, { root: true })
```  


### Include RSInject.vue somewhere

include the player component, and some links to handle it
```
import RSInject from './modules/rsinject/components/RSInject.vue'
...
<RSInject />
...
<!-- store actions -->
<button @click="$store.dispatch('rsinject/load')">Load the player</button>
<button @click="$store.dispatch('rsinject/disable')">Disable the player</button>
<button @click="$store.dispatch('rsinject/enable')">Enable the player</button>
<button @click="$store.dispatch('rsinject/play')">Play</button>
<button @click="$store.dispatch('rsinject/pause')">Pause</button>
<button @click="$store.dispatch('rsinject/stop')">Stop</button>
<!-- store getters -->
<p v-if="$store.getters['rsinject/loaded]">Loaded</p>
<p v-if="$store.getters['rsinject/enabled]">Enabled</p>
<p v-if="$store.getters['rsinject/error]">Error</p>
```