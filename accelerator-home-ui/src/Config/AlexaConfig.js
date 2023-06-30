/**
 * If not stated otherwise in this file or this component's LICENSE
 * file the following copyright and licenses apply:
 *
 * Copyright 2020 RDK Management
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/
//Payloads, and other keys related to alexa and voiceControl plugin.

export const AlexaLauncherKeyMap = { //app/shortcuts identifier and callsign map
    "amzn1.alexa-ask-target.app.70045": {
      "name": "YouTube",
      "callsign": "YouTube",
      "url": "",
    },
    "amzn1.alexa-ask-target.app.50623": {
        "name": "YouTubeTV",
        "callsign": "YouTubeTV",
        "url": "",
    },
    "amzn1.alexa-ask-target.app.09817": {
        "name": "YouTubeKids",
        "callsign": "YouTubeKids",
        "url": "",
    },
    "amzn1.alexa-ask-target.app.58952": {
      "name": "CNN go",
      "callsign": "LightningApp",
      "url": "https://widgets.metrological.com/lightning/rdk/d431ce8577be56e82630650bf701c57d#app:com.metrological.app.CNN",
    },
    "amzn1.alexa-ask-target.app.72095": {
        "name": "Prime Video",
        "callsign": "Amazon",
        "url": "",
    },
    "amzn1.alexa-ask-target.app.36377": {
        "name": "Netflix",
        "callsign": "Netflix",
        "url": "",
    },
    "amzn1.alexa-ask-target.app.34908": {
        "name": "XUMO",
        "callsign": "HtmlApp",
        "url": "https://x1box-app.xumo.com/index.html",
    },
    "amzn1.alexa-ask-target.app.94721": {
        "name": "NBCU Peacock",
        "callsign": "Peacock",
        "url": "",
    },
    "amzn1.alexa-ask-target.app.92933": {
        "name": "Vimeo",
        "callsign": "LightningApp",
        "url": "https://widgets.metrological.com/lightning/rdk/d431ce8577be56e82630650bf701c57d#app:com.metrological.app.VimeoRelease",
    },
    "amzn1.alexa-ask-target.app.96247": {
        "name": "The Weather Network",
        "callsign": "LightningApp",
        "url": "https://widgets.metrological.com/lightning/rdk/d431ce8577be56e82630650bf701c57d#app:com.metrological.app.WeatherNetwork",
    },
    "amzn1.alexa-ask-target.app.48144": {
        "name": "Euronews",
        "callsign": "LightningApp",
        "url": "https://widgets.metrological.com/lightning/rdk/d431ce8577be56e82630650bf701c57d#app:com.metrological.app.Euronews",
    },
    "amzn1.alexa-ask-target.app.54002": {
        "name": "AccuWeather - Weather for Life",
        "callsign": "LightningApp",
        "url": "https://widgets.metrological.com/lightning/rdk/d431ce8577be56e82630650bf701c57d#app:com.metrological.app.AccuWeather",
    },
    "amzn1.alexa-ask-target.app.58518": {
        "name": "Al Jazeera",
        "callsign": "LightningApp",
        "url": "https://widgets.metrological.com/lightning/rdk/d431ce8577be56e82630650bf701c57d#app:com.metrological.app.Aljazeera",
    },
    "amzn1.alexa-ask-target.app.41915": {
        "name": "Radioline",
        "callsign": "LightningApp",
        "url": "https://widgets.metrological.com/lightning/rdk/d431ce8577be56e82630650bf701c57d#app:com.metrological.app.Radioline",
    },
    "amzn1.alexa-ask-target.app.45441": {
        "name": "Wallstreet Journal",
        "callsign": "LightningApp",
        "url": "https://widgets.metrological.com/lightning/rdk/d431ce8577be56e82630650bf701c57d#app:com.metrological.app.WallStreetJournal",
    },
    "amzn1.alexa-ask-target.app.47328": {
        "name": "Radio by MyTuner",
        "callsign": "LightningApp",
        "url": "https://widgets.metrological.com/lightning/rdk/d431ce8577be56e82630650bf701c57d#app:com.appgeneration.mytuner",
    },
    "amzn1.alexa-ask-target.app.79431": {
        "name": "Tastemade TV",
        "callsign": "LightningApp",
        "url": "https://widgets.metrological.com/lightning/rdk/d431ce8577be56e82630650bf701c57d#app:com.metrological.app.Tastemade",
    },
    "amzn1.alexa-ask-target.app.16283": {
        "name": "Bloomberg TV+",
        "callsign": "LightningApp",
        "url": "https://widgets.metrological.com/lightning/rdk/d431ce8577be56e82630650bf701c57d#app:com.bloomberg.metrological.x1",
    },
    "amzn1.alexa-ask-target.app.79143": {
        "name": "Free Games by PlayWorks",
        "callsign": "LightningApp",
        "url": "https://widgets.metrological.com/lightning/rdk/d431ce8577be56e82630650bf701c57d#app:com.playworks.pwkids",
    },
    //shortcuts
    "amzn1.alexa-ask-target.shortcut.33122": {
        "name": "Home",
        "route": "menu"
    },
    "amzn1.alexa-ask-target.shortcut.28647": {
        "name": "Apps",
        "route": "apps"
    },
    "amzn1.alexa-ask-target.shortcut.68228": {
        "name": "Guide",
        "route": "epg"
    },
    "amzn1.alexa-ask-target.shortcut.07395": {
        "name": "Settings",
        "route": "settings"
    },
    "amzn1.alexa-ask-target.shortcut.94081": {
        "name": "Bluetooth Settings",
        "route": "settings/bluetooth"
    },
    "amzn1.alexa-ask-target.shortcut.58566": {
        "name": "Network Settings",
        "route": "settings/network"
    },
    "amzn1.alexa-ask-target.shortcut.12736": {
        "name": "Privacy Settings",
        "route": "settings/other/privacy"
    },
  };
  export const errorPayload =
  {
    "msgPayload":{
    "event": {
      "header": {
        "namespace": "Alexa",
        "name": "ErrorResponse",
        "messageId": "Unique identifier, preferably a version 4 UUID",
         "correlationToken": "Opaque correlation token that matches the request",
        "payloadVersion": "3"
      },
      "endpoint":{
        "endpointId": "Endpoint ID"
      },
      "payload": {
        "type": "Error type",
        "message": "Error message"
      }
    }
   }
  }
  export const PlaybackStateReport = {
    "msgPayload": {
        "event": {
            "header":
            {
                "namespace": "Alexa",
                 "name": "ChangeReport",
                "messageId": "3d2521f2-4e93-4158-b91e-ba04637b91a9",
                 "payloadVersion": "3"
            },
            "endpoint": { "endpointId": "rdk-video-device" },
            "payload": {
                "change": {
                    "cause": { "type": "PHYSICAL_INTERACTION" },
                    "properties": [{
                        "namespace": "Alexa.PlaybackStateReporter",
                         "name":"playbackState",
                          "value": { "state": "Pause/stop/Resume/Play" },
                        "timeOfSample": new Date().getFullYear() + "-"
                        + (new Date().getMonth()+1)  + "-"
                        + new Date().getDate() + "T"
                        + new Date().getHours() + ":"
                        + new Date().getMinutes() + ":"
                        + new Date().getSeconds()+"Z",
                        "uncertaintyInMilliseconds": 0
                    }]
                }
            }
        }
    }
}
export const VolumePayload = {
    "msgPayload": {
         "event": {
        "header": {
            "namespace": "Speaker",
            "name": "VolumeChanged",
            "messageId": "8912c9cc-a770-4fe9-8bf1-87e01a4a1f0b"
        },
        "payload": {
            "volume": 30,
            "muted": false
        }
    }}
}
