# ReadSpeakerInject for HTML

This script allows you to add ReadSpeaker (readspeaker.com)
to your HTML app without modifying your HTML or much
of the site.

RSInject needs to be `init`ed, `load`ed and 
`enable`d before it does anything; in that order. 

The script defines the concept of `Zones`, which
contain metadata about speakable areas in your app. 
Each zone can specify (oa) multiple (css) queryselectors 
to read from and one (css) queryselector to inject a speaker
link in.

If all that is done, on every DOM change, the DOM will be 
reinspected and if RSInject finds new zones, the zone will be 
prepared and speaker buttons injected according 
to your config.

## Demo

To run this particular demo, run 
```
npm install

# edit config file, insert your customer id
cp src/js/config.js-dist src/js/config.js
nano src/config.js

npm run demo
```

Ofcourse, the domain you run this on should be enabled 
in your ReadSpeaker account.

## Using RSInject in your own site

Generate the demo first. This will compile
the vanilla javascript in the `demo/js` folder.

### demo/js/RSInject.js

Copy the script somewhere in your site.

### HTML

Add this to your HTML

```
<script type='module'>
    import RSInject from './js/RSInject.js';
    window.RSInject = RSInject;
    window.addEventListener('DOMContentLoaded',function () {
        RSInject.init()
    });
</script>
..
<div id="rsi-player" class="rs_addtools rs_splitbutton rs_preserve rs_skip rs_exp"></div>
<button id="load" onclick="RSInject && RSInject.load()">load readspeaker</button>
<button id="enable" onclick="RSInject && RSInject.enable()">enable readspeaker</button>
..
```

#### demo/config.js

Copy `demo/config.js` somewhere in your site and edit it.
RSInject requires it; make sure the path is set correctly.

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


#### Finetune css

Look in src/rsinject.css for options on finetuning css.

