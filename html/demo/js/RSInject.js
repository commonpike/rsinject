// start html header
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import RSInjectConfig from '../config.js';
const nextTick = (f) => {
    setTimeout(f, 500);
};
const store = {
    dispatch: (c) => {
        if (c === 'rsinject/disable') {
            RSInject.disable();
        }
    }
};
const process = undefined;
class RSInject {
    static init() {
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
        };
        this.config.script_url.replace('{{customer_id}}', this.config.customer_id);
    }
    static load() {
        return __awaiter(this, void 0, void 0, function* () {
            this.debug('load');
            return yield this.loadScript().then(() => {
                document.body.classList.add('rsi-loaded');
                if (window.rspkr.params.mobile) {
                    document.body.classList.add('rsi-mobile');
                }
                this.loaded = true;
                if (this.config.enable_on_load) {
                    this.enable();
                }
            });
        });
    }
    static enable() {
        this.debug('enable ' + this.enabled);
        if (!this.enabled) {
            this.update();
            this.watch();
            this.enabled = true;
            document.body.classList.add('rsi-enabled');
            if (this.config.rsConf.ui.tools.controlpanel) {
                document.body.classList.add('rsi-hidden');
            }
            if (this.config.read_on_enable) {
                nextTick(() => {
                    this.readFirstSpeakerLink();
                });
            }
        }
    }
    static disable() {
        this.debug('disable ' + this.enabled);
        if (this.enabled) {
            this.disableAllZoneElements();
            this.zoneCounter = 0;
            this.unwatch();
            this.enabled = false;
            document.body.classList.remove('rsi-enabled', 'rsi-hidden');
            // if you came from the rsConf.callback.ui close event, and thus went
            // through onClose and the store.dispatch before you got here, this is 
            // already done. Nevertheless
            window.rspkr && window.rspkr.ui && window.rspkr.ui.destroyActivePlayer();
        }
    }
    static update() {
        this.debug('update');
        if (this.currentSpeaker && this.playing) {
            if (!document.body.contains(this.currentSpeaker)) {
                this.stop();
            }
        }
        for (const zonekey in this.config.zones) {
            const zone = this.config.zones[zonekey];
            this.getZoneElements(zone).forEach(elem => {
                this.enableZoneElement(zonekey, zone, elem);
            });
        }
    }
    static play() {
        window.rspkr && window.rspkr.PlayerAPI.play();
        this.onPlay();
    }
    static pause() {
        window.rspkr && window.rspkr.PlayerAPI.pause();
        this.onPause();
    }
    static stop() {
        window.rspkr && window.rspkr.PlayerAPI.stop();
        window.rspkr && window.rspkr.PlayerAPI.rewind();
        this.onStop();
    }
    static onPlay() {
        var _a;
        RSInject.debug("onPlay");
        (_a = RSInject.currentSpeaker) === null || _a === void 0 ? void 0 : _a.classList.remove('rsi-speaker-paused');
        RSInject.playing = true;
    }
    static onPause() {
        var _a;
        RSInject.debug("onPause");
        (_a = RSInject.currentSpeaker) === null || _a === void 0 ? void 0 : _a.classList.add('rsi-speaker-paused');
        RSInject.playing = false;
    }
    static onStop() {
        RSInject.debug("onStop");
        RSInject.setCurrentSpeaker(undefined);
        RSInject.playing = false;
    }
    static onClose() {
        RSInject.debug("onClose");
        store.dispatch('rsinject/disable');
    }
    static onSpeakerClick(e) {
        const elem = e.target;
        if (this.currentSpeaker === elem) {
            if (this.playing) {
                this.debug('onSpeakerClick', 'local pause');
                this.pause();
            }
            else {
                this.debug('onSpeakerClick', 'local play');
                this.play();
            }
        }
        else {
            this.setCurrentSpeaker(elem);
            window.readpage(elem.href, this.config.player_id);
        }
    }
    static loadScript() {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                if (document.getElementById('rs_req_Init')) {
                    reject('RSInject.loadScript: already loaded');
                }
                const script = document.createElement("script");
                script.type = "text/javascript";
                script.id = "rs_req_Init";
                script.addEventListener("error", event => {
                    console.error("RSInject.loadScript: network error", event);
                    reject('RSInject.loadScript: network error');
                });
                script.addEventListener("load", event => {
                    this.debug("script loaded :)");
                    this.onready(() => resolve());
                });
                script.src = this.config.script_url;
                document.head.appendChild(script);
            });
        });
    }
    static onready(callback) {
        const interval = setInterval(function () {
            if (window['rspkr']) {
                clearInterval(interval);
                callback();
            }
        }, this.throttleTimeout);
    }
    static createReadClass(zonekey) {
        return this.config.read_class + '-' + zonekey + '-' + this.zoneCounter++;
    }
    static getSpeakerUrl(readclass) {
        let url = new URL(this.config.read_url);
        url.protocol = document.location.protocol;
        url.search = new URLSearchParams({
            customerid: String(this.config.customer_id),
            lang: this.config.lang,
            readclass: readclass
        }).toString();
        return url.toString();
    }
    static getSpeakerLink(readclass, speaker_class) {
        const a = document.createElement("a");
        a.appendChild(document.createTextNode(this.config.speaker_text));
        a.href = this.getSpeakerUrl(readclass);
        a.onclick = function (e) {
            RSInject.onSpeakerClick(e);
            return false;
        };
        a.dataset.target = this.config.player_id;
        a.classList.add('rs_skip', this.config.speaker_class);
        if (speaker_class) {
            a.classList.add(speaker_class);
        }
        return a;
    }
    static setCurrentSpeaker(elem) {
        this.debug('setCurrentSpeaker');
        this.currentSpeaker = elem;
        const activeClass = RSInject.config.speaker_class + '-active';
        Array.from(document.getElementsByClassName(activeClass)).forEach((prevElem) => {
            prevElem.classList.remove(activeClass);
        });
        if (this.currentSpeaker) {
            this.currentSpeaker.classList.add(activeClass);
        }
    }
    static readFirstSpeakerLink() {
        this.debug('readFirstSpeakerLink');
        if (this.enabled) {
            const speakerLink = document.querySelector('.' + this.config.speaker_class);
            if (speakerLink) {
                setTimeout(() => {
                    this.debug('readFirstSpeakerLink', speakerLink.href);
                    window.readpage(speakerLink.href, this.config.player_id);
                    this.setCurrentSpeaker(speakerLink);
                }, this.throttleTimeout);
            }
            else {
                this.debug('readFirstSpeakerLink', 'no speaker found');
            }
        }
        else {
            this.debug('readFirstSpeakerLink', 'not enabled');
        }
    }
    static getZoneElements(zone) {
        const elems = [];
        document.querySelectorAll(zone.zone_selector).forEach(elem => {
            if (zone.greedy || !elem.classList.contains(this.config.zone_class)) {
                elems.push(elem);
            }
        });
        return elems;
    }
    static enableZoneElement(zonekey, zone, containerElement) {
        var _a;
        if (!zone.greedy && containerElement.classList.contains(this.config.zone_class)) {
            this.debug('enableZoneElement: element already processed');
            return;
        }
        const readElements = [];
        if (zone.read_selectors.length === 0) {
            readElements.push(containerElement);
        }
        zone.read_selectors.forEach(sel => {
            containerElement.querySelectorAll(sel).forEach(elem => {
                readElements.push(elem);
            });
        });
        if (!readElements.length) {
            this.debug('enableZoneElement: element does not contain readElements');
            return;
        }
        this.debug("enableZoneElement", containerElement, readElements);
        const speakerContainer = zone.speaker_selector ?
            containerElement.querySelector(zone.speaker_selector) :
            containerElement;
        if (!speakerContainer) {
            this.debug('enableZoneElement: not ready to display speaker here');
            return;
        }
        // set a class on the container
        containerElement.classList.add(this.config.zone_class, this.config.zone_class + '-' + zonekey);
        // get or create the readclass
        let readclass = (_a = containerElement.dataset.rsiReadclass) !== null && _a !== void 0 ? _a : '';
        if (!readclass) {
            readclass = this.createReadClass(zonekey);
            containerElement.dataset.rsiReadclass = readclass;
        }
        // set read classes on the read_selectors elems
        readElements.forEach(elem => {
            elem.classList.add(this.config.read_class, readclass);
        });
        // set rs_skip on the skip_selectors elems
        zone.skip_selectors.forEach(sel => {
            containerElement.querySelectorAll(sel).forEach(elem => {
                elem.classList.add('rs_skip');
            });
        });
        // tmp remove aria-label on the noaria_selectors elems
        zone.noaria_selectors.forEach(sel => {
            containerElement.querySelectorAll(sel).forEach(elem => {
                const aria = elem.getAttribute('aria-label');
                if (aria) {
                    elem.setAttribute('rsi-aria-label', aria);
                    elem.removeAttribute('aria-label');
                    elem.classList.add('rsi-aria-hidden');
                }
            });
        });
        // insert a speaker link in the container
        const speakerElement = containerElement.querySelector(zone.speaker_selector + ' .' + this.config.speaker_class);
        if (!speakerElement) {
            if (speakerContainer) {
                if (zone.speaker_position === 'after') {
                    speakerContainer.append(this.getSpeakerLink(readclass, zone.speaker_class));
                }
                else if (zone.speaker_position === 'before') {
                    speakerContainer.prepend(this.getSpeakerLink(readclass, zone.speaker_class));
                }
            }
        }
        else {
            this.debug('enableZoneElement: element already contains a speakerElement');
        }
    }
    static disableAllZoneElements() {
        Array.from(document.getElementsByClassName(this.config.zone_class)).forEach(elem => {
            var _a;
            // remove container classes
            const toRemove = [];
            for (const classname of elem.classList) {
                if (classname.startsWith(this.config.zone_class)) {
                    toRemove.push(classname);
                }
            }
            elem.classList.remove(...toRemove);
            delete elem.dataset.rsiReadclass;
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
                    subelem.setAttribute('aria-label', aria);
                    subelem.removeAttribute('rsi-aria-label');
                }
                subelem.classList.remove('rsi-aria-hidden');
            });
            // remove speaker links 
            var links = elem.getElementsByClassName(this.config.speaker_class);
            for (var link of links) {
                (_a = link.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(link);
            }
            ;
        });
    }
    static watch() {
        return __awaiter(this, void 0, void 0, function* () {
            this.debug('watch');
            if (this.observer) {
                this.unwatch();
            }
            const targetNode = document.querySelector(this.config.root_selector);
            if (targetNode) {
                if (!this.observer) {
                    const callback = (mutationList) => {
                        for (const mutation of mutationList) {
                            if (mutation.type === "childList") {
                                clearTimeout(this.throttle);
                                this.throttle = setTimeout(() => this.update(), this.throttleTimeout);
                            }
                        }
                    };
                    this.observer = new MutationObserver(callback);
                }
                const config = { childList: true, subtree: true };
                this.observer.observe(targetNode, config);
            }
            else {
                console.error(this.config.root_selector + ' not found; check you config');
            }
        });
    }
    static unwatch() {
        if (this.observer) {
            this.observer.disconnect();
        }
    }
    static debug(...contents) {
        if (this.debugging) {
            contents.unshift('RSInject');
            console.log(...contents);
        }
    }
}
RSInject.loaded = false;
RSInject.enabled = false;
RSInject.playing = false;
RSInject.error = "";
RSInject.config = RSInjectConfig;
RSInject.debugging = true;
RSInject.throttleTimeout = 500;
RSInject.zoneCounter = 0;
export default RSInject;
