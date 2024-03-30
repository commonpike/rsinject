export default {
    "rsConf" : { 
        "general": { 
            "usePost": true,
            "uiLang": "nl_nl",
            "nativeLanguages": true,
            "customTransLangs": [],
            "translatedDisclaimer": true
        },
        "ui": {
            "mobileVertPos": "top=22",
            "tools": {
                "controlpanel": false,
                "skipbuttons": true,
                "speedbutton": true

            },
            "controlpanel": {
                "vertical": "bottom",
                "horizontal": "right"
            }
        }
    },
    "customer_id": 11564,
    "script_url": "//cdn-eu.readspeaker.com/script/11564/webReader/webReader.js?pids=wr",
    "read_url": "https://app-eu.readspeaker.com/cgi-bin/rsent",
    "lang": "nl_nl",
    "player_id": "rsi-player",
    "zone_class": "rsi-zone",
    "speaker_class": "rsi-speaker",
    "speaker_text": "lees voor",
    "read_class": "rsi-read",
    "enable_on_load": true,
    "read_on_enable": true,
    "dictionary": {
        "link_load": "Load ReadSpeaker",
        "link_enable": "Enable ReadSpeaker",
        "error_title": "Oops! An error occurred",
        "error_text": "An error occurred while loading the ReadSpeaker. Check your setup and try again.",
        "error_close": "Close"
    },
    "root_selector": "body",
    "zones": {
        "help": {
            "zone_selector": "#rsp-help",
            "read_selectors": [],
            "skip_selectors": ["button"],
            "noaria_selectors": [],
            "speaker_selector": "",
            "speaker_position": "before"
        },
        "demo1": {
            "zone_selector": "#demo1",
            "read_selectors": [],
            "skip_selectors": [],
            "noaria_selectors": [],
            "speaker_selector": "",
            "speaker_position": "before"
        },
        "demo2": {
            "zone_selector": "#demo2",
            "read_selectors": [".demo2-content"],
            "skip_selectors": [],
            "noaria_selectors": [],
            "speaker_selector": "i",
            "speaker_position": "after",
            "speaker_class": "very-special-speaker"
        },
        "demo3": {
            "zone_selector": "#demo3",
            "read_selectors": [".demo3-content"],
            "skip_selectors": [],
            "noaria_selectors": ["p"],
            "speaker_selector": "b",
            "speaker_position": "after"
        }
    } 
}