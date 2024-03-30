// start vue header
import RSInjectConfig from '../config.json';
import store from '../../../store';
import { nextTick } from 'vue';
// end vue header
//import RSInjectConfig from '../config.json';
//import store from '../../../store';
//import { nextTick } from 'vue';

declare global {
    interface Window { 
        rspkr: any; 
        rsConf : { 
            general: { 
                usePost: boolean 
            },
            ui: {
                tools: {
                    controlpanel: boolean
                }
            }
            cb?: {
                ui: {
                    [key: string] : Function
                },
                audio: {
                    [key: string] : Function
                }
            }
        };
        readpage: Function;
    }
}

interface Zone {
    zone_selector: string;
    read_selectors: string[];
    skip_selectors: string[];
    noaria_selectors: string[];
    speaker_selector: string;
    speaker_position: 'before'|'after'|'none';
    speaker_class?: string;
    greedy?: boolean
}

export default class RSInject {

    static loaded: boolean = false;
    static enabled: boolean = false;
    static playing: boolean = false;
    static currentSpeaker?: Element;
    static error = "";
    private static config = RSInjectConfig;
    private static debugging = true;
    private static throttle: number;
    private static throttleTimeout = 500;
    private static observer: MutationObserver;
    public static zoneCounter = 0;

    public static init() {
        this.debug('init');
        if (window.rspkr) {
            this.debug('already inited');
            return;
        }
        window.rsConf = this.config.rsConf;
        window.rsConf.cb = {
            ui: {
                play: RSInject.onPlay,
                pause: RSInject.onPause,
                stop: RSInject.onStop,
                close: RSInject.onClose
            },
            audio: {
                ended: RSInject.onStop
            }
        }
    }

    public static async load() {
        this.debug('load');
        return await this.loadScript().then(()=>{
            document.body.classList.add('rsi-loaded');
            if (window.rspkr.params.mobile) {
                document.body.classList.add('rsi-mobile');
            }
            this.loaded=true;
            if (this.config.enable_on_load) {
                this.enable();
            }
        });        
    }

    
    public static enable() {
        this.debug('enable '+this.enabled);
        if (!this.enabled) {
            this.update();
            this.watch();
            this.enabled = true;
            document.body.classList.add('rsi-enabled');
            if (this.config.rsConf.ui.tools.controlpanel) {
                document.body.classList.add('rsi-hidden');
            } 
            if (this.config.read_on_enable) {
                nextTick(()=> {
                    this.readFirstSpeakerLink();
                });
            }
        }
    }

    public static disable() {
        this.debug('disable '+this.enabled);
        if (this.enabled) {
            this.disableAllZoneElements();
            this.zoneCounter=0;
            this.unwatch();
            this.enabled = false;
            document.body.classList.remove('rsi-enabled','rsi-hidden');
            // if you came from the rsConf.callback.ui close event, and thus went
            // through onClose and the store.dispatch before you got here, this is 
            // already done. Nevertheless
            window.rspkr && window.rspkr.ui && window.rspkr.ui.destroyActivePlayer();
        }
    }

    public static update() {
        this.debug('update');
        for (const zonekey in this.config.zones) {
            const zone = (this.config.zones as { [key: string]: Zone })[zonekey] ;
            this.getZoneElements(zone).forEach(elem=> {
                this.enableZoneElement(zonekey,zone,elem);
            });
        }
    }

    public static play() {
        window.rspkr && window.rspkr.PlayerAPI.play();
        this.onPlay();
    }
    public static pause() {
        window.rspkr && window.rspkr.PlayerAPI.pause();
        this.onPause();
    }
    public static stop() {
        window.rspkr && window.rspkr.PlayerAPI.stop();
        window.rspkr && window.rspkr.PlayerAPI.rewind();
        this.onStop();
    }

    public static onPlay() {
        RSInject.debug("onPlay");
        RSInject.currentSpeaker?.classList.remove('rsi-speaker-paused');
        RSInject.playing = true;
    }
    public static onPause() {
        RSInject.debug("onPause");
        RSInject.currentSpeaker?.classList.add('rsi-speaker-paused');
        RSInject.playing = false;
    }
    public static onStop() {
        RSInject.debug("onStop");
        RSInject.setCurrentSpeaker(undefined);
        RSInject.playing = false;
    }
    public static onClose() {
        RSInject.debug("onClose");
        store.dispatch('rsinject/disable');
    }
    public static onSpeakerClick(e: Event) {
        const elem = e.target as HTMLAnchorElement;
        if (this.currentSpeaker===elem) {
            if (this.playing) {
                this.debug('onSpeakerClick','local pause');
                this.pause();
            } else {
                this.debug('onSpeakerClick','local play');
                this.play();
            }
            
        } else {
            this.setCurrentSpeaker(elem);
            window.readpage(elem.href, this.config.player_id); 
        }
    }

    private static async loadScript() {
        return new Promise((resolve: Function,reject: Function) => {
            if (document.getElementById('rs_req_Init')) {
                reject('RSInject.loadScript: already loaded');
            }
            const script = document.createElement("script");
            script.type = "text/javascript";
            script.id = "rs_req_Init";
            script.addEventListener("error", event => {
                console.error("RSInject.loadScript: network error",event);
                reject('RSInject.loadScript: network error');
            });
            script.addEventListener("load", event => {
                this.debug("script loaded :)");       
                this.onready(()=>resolve());
            });
            script.src = this.config.script_url;
            document.head.appendChild(script);
        });
    }

    private static onready(callback: Function) {
        const interval = setInterval(function() {
            if (window['rspkr']) {
                clearInterval(interval);
                callback();
            }
        }, this.throttleTimeout);
    }

    private static createReadClass(zonekey: string) {
        return this.config.read_class+'-'+zonekey+'-'+this.zoneCounter++;
    }
    
    private static getSpeakerUrl(readclass: string) {
        let url = new URL(this.config.read_url);
        url.protocol = document.location.protocol;
        url.search = new URLSearchParams({
            customerid: String(this.config.customer_id),
            lang: this.config.lang,
            readclass: readclass
        }).toString();
        return url.toString();
    }

    private static getSpeakerLink(readclass: string, speaker_class?: string) { 
        const a = document.createElement("a");
        a.appendChild(document.createTextNode(this.config.speaker_text));
        a.href = this.getSpeakerUrl(readclass);
        a.onclick = function(e) { 
            RSInject.onSpeakerClick(e);
            return false; 
        };
        a.dataset.target = this.config.player_id;
        a.classList.add('rs_skip',this.config.speaker_class);
        if (speaker_class) {
            a.classList.add(speaker_class);
        }
        return a;
    }

    private static setCurrentSpeaker(elem?: Element) {
        this.debug('setCurrentSpeaker');
        this.currentSpeaker = elem;
        const activeClass = RSInject.config.speaker_class+'-active';
        Array.from(document.getElementsByClassName(activeClass)).forEach((prevElem) => {
            prevElem.classList.remove(activeClass);
        });
        if (this.currentSpeaker) {
            this.currentSpeaker.classList.add(activeClass);
        }
    }

    private static readFirstSpeakerLink() {
        this.debug('readFirstSpeakerLink');
        if (this.enabled) {
            const speakerLink = document.querySelector('.'+this.config.speaker_class) as HTMLAnchorElement;
            if (speakerLink) {
                setTimeout(()=> {
                    this.debug('readFirstSpeakerLink',speakerLink.href);
                    window.readpage(speakerLink.href, this.config.player_id);
                    this.setCurrentSpeaker(speakerLink);
                }, this.throttleTimeout);
            } else {
                this.debug('readFirstSpeakerLink','no speaker found');
            }
        } else {
            this.debug('readFirstSpeakerLink','not enabled');
        }
    }

    
    private static getZoneElements(zone: Zone) { 
        const elems: HTMLElement[] = [];
        document.querySelectorAll(zone.zone_selector).forEach(elem=> {
            if (zone.greedy || !elem.classList.contains(this.config.zone_class)) {
                elems.push(elem as HTMLElement);
            }
        });
        return elems;
    }

    private static enableZoneElement(zonekey: string, zone: Zone, containerElement: HTMLElement) { 
        
        if (!zone.greedy && containerElement.classList.contains(this.config.zone_class)) {
            this.debug('enableZoneElement: element already processed');
            return;
        }

        const readElements: Element[] = [];
        if (zone.read_selectors.length===0) {
            readElements.push(containerElement);
        }
        zone.read_selectors.forEach(sel=> {
            containerElement.querySelectorAll(sel).forEach(elem=> {
                readElements.push(elem);
            });
        });
        
        if (!readElements.length) {
            this.debug('enableZoneElement: element does not contain readElements');
            return;
        }
        
        this.debug("enableZoneElement",containerElement,readElements);

        const speakerContainer = zone.speaker_selector ? 
                containerElement.querySelector(zone.speaker_selector):
                containerElement;
        if (!speakerContainer) {
            this.debug('enableZoneElement: not ready to display speaker here');
            return;
        }
            
        // set a class on the container
        containerElement.classList.add(this.config.zone_class,this.config.zone_class+'-'+zonekey);

        // get or create the readclass
        let readclass = containerElement.dataset.rsiReadclass ?? '';
        if (!readclass) {
            readclass = this.createReadClass(zonekey);
            containerElement.dataset.rsiReadclass = readclass;
        }
        
        // set read classes on the read_selectors elems
        readElements.forEach(elem=> {
            elem.classList.add(this.config.read_class,readclass);
        });

        // set rs_skip on the skip_selectors elems
        zone.skip_selectors.forEach(sel=> {
            containerElement.querySelectorAll(sel).forEach(elem=> {
                elem.classList.add('rs_skip');
            });
        });

        // tmp remove aria-label on the noaria_selectors elems
        zone.noaria_selectors.forEach(sel=> {
            containerElement.querySelectorAll(sel).forEach(elem=> {
                const aria = elem.getAttribute('aria-label');
                if (aria) {
                    elem.setAttribute('rsi-aria-label',aria);
                    elem.removeAttribute('aria-label');
                    elem.classList.add('rsi-aria-hidden');
                }
            });
        });

        // insert a speaker link in the container
        const speakerElement = containerElement.querySelector(zone.speaker_selector+' .'+this.config.speaker_class);
        if (!speakerElement) {
            if (speakerContainer) {
                if (zone.speaker_position==='after') {
                    speakerContainer.append(this.getSpeakerLink(readclass,zone.speaker_class));
                } else if (zone.speaker_position==='before') {
                    speakerContainer.prepend(this.getSpeakerLink(readclass,zone.speaker_class));
                }
            }
        } else {
            this.debug('enableZoneElement: element already contains a speakerElement');
        }
        
    }

    static disableAllZoneElements() {
        
        Array.from(document.getElementsByClassName(this.config.zone_class)).forEach(elem=> { 

            // remove container classes
            const toRemove = [];
            for (const classname of elem.classList) {
                if (classname.startsWith(this.config.zone_class)) {
                    toRemove.push(classname);
                } 
            }
            elem.classList.remove(...toRemove);
            delete (elem as HTMLElement).dataset.rsiReadclass;

            // remove read classes
            Array.from(elem.getElementsByClassName(this.config.read_class)).forEach(subelem => {
                const toRemove = [];
                for (const classname of subelem.classList) {
                    if (classname.startsWith(this.config.read_class)) {
                        toRemove.push(classname);
                    }
                }
                subelem.classList.remove(...toRemove);
            });

            // restore aria-labels
            Array.from(elem.getElementsByClassName('rsi-aria-hidden')).forEach(subelem => {
                const aria = subelem.getAttribute('rsi-aria-label');
                if (aria) {
                    subelem.setAttribute('aria-label',aria);
                    subelem.removeAttribute('rsi-aria-label');
                }
                subelem.classList.remove('rsi-aria-hidden');
            });

            // remove speaker links 
            var links = elem.getElementsByClassName(this.config.speaker_class);
            for (var link of links) {
                link.parentNode?.removeChild(link);
            };

        });

        
    }

    private static async watch() {
        this.debug('watch');
        if (this.observer) {
            this.unwatch();
        }

        const targetNode = document.getElementById("app");
        if (targetNode) {
            if (!this.observer) {
                const callback = (mutationList: MutationRecord[]) => {
                    for (const mutation of mutationList) {
                        if (mutation.type === "childList") {
                            clearTimeout(this.throttle);
                            this.throttle = setTimeout(()=>this.update(),this.throttleTimeout);
                        } 
                    }
                };
                this.observer = new MutationObserver(callback);
            }
            const config = { childList: true, subtree: true };
            this.observer.observe(targetNode, config);
        }

    }

    private static unwatch() {
        this.observer.disconnect();
    }

    private static debug(...contents: any[]) {
        if (this.debugging) {
            contents.unshift('RSInject');
            console.log(...contents);
        }
    }


}