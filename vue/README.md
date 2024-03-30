# ReadSpeakerPlayer for Vue

This Vue module allows you to add ReadSpeaker (readspeaker.com)
to your Vue app without modifying your Vue templates or much
of the app.

This is not a NPM module. You need to manually 
copy the module code to your app.

RSPlayer needs to be `init`ed, `load`ed and 
`enable`d before it does anything. The include .vue component
will do these things for you; read more below.

The module defines the concept of `Zones`, which
contain metadata about speakable areas in your app. 
Each zone can specify (oa) multiple (css) queryselectors 
to read from and one (css) queryselector to insert a speaker
link in.

If all that is done, on every DOM change, the DOM will be 
reinspected and if RSPlayer finds new zones, the zone will be 
prepared and speaker buttons inserted according 
to your config.

## Demo

To run this particular demo, run 
```
npm install
npm run serve
```

## Using RSInject in your own project

### src/modules/rsplayer

Copy the module folder to `src/modules/rsplayer`

#### Edit the config.json 
It contains the `window.rsConf` that ReadSpeaker wants,
plus extra settings for RSPlayer, including the `zones`.

Zones are areas to read within your app. Within each zone,
 - `zone_selector` defines the container for a zone
 - `read_selectors` define what to read inside the zone, and
 - `speaker_selector` defines where to place the speaker button inside the zone
 - `skip_selectors` defines what elements to `rs_skip` inside the zone
 - `noaria_selectors` define where to remove aria-label inside the zone
 - `greedy` optional, false by default. When rsplayer has initialized a zone, it will not re-evaluate that zone even if there are changes on the page, to save CPU. Set to true to always evaluate the contents of a zone, even if it has been evaluated before. 


#### Finetune RSPlayer.vue  

It contains the (split) player and a help page.
It also loads the global css for styling, oa,
the speaker links throughout the app. Edit to your likings.


#### Finetune css

Edit settings for your site in rsplayer.less.
It also contains a custom skin in skin.less. 

### main.js

register and init the module. In main.js, add
```
import rsinject from './modules/rsinject/module'
...
store.registerModule('rsinject', rsinject.store)
store.dispatch('rsinject/init', router, { root: true })
```  

if you havent already, allow typescript to resolve json
and/or support newer forms of for...of loops
in `tsconfig.json`, add 
```
"compilerOptions": {
    "resolveJsonModule": true,
    "downlevelIteration": true
}
```

### Include RSPlayer.vue somewhere

include the player components and help page, and some links to handle it
```
import RSInject from './modules/rsinject/components/RSInject.vue'
...
<RSInject />

<!-- optional goodies -->
<button @click="$store.dispatch('rsinject/load')">Load the player</button>
<button @click="$store.dispatch('rsinject/disable')">Disable the player</button>
<button @click="$store.dispatch('rsinject/enable')">Enable the player</button>
<button @click="$store.dispatch('rsinject/play')">Play</button>
<button @click="$store.dispatch('rsinject/pause')">Pause</button>
<button @click="$store.dispatch('rsinject/stop')">Stop</button>
```