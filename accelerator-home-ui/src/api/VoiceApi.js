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
import ThunderJS from 'ThunderJS';
import { CONFIG } from '../Config/Config'

export default class VoiceApi {
    constructor() {
      this._events = new Map();
      this.thunder = ThunderJS(CONFIG.thunderConfig);
      this.INFO = function(){};
      this.LOG = function(){};
      this.ERR = console.error;
    }
    registerEvent(eventId, callback) {
      this._events.set(eventId, callback)
    }
    activate() {
      return new Promise((resolve, reject) => {
        this.INFO("VoiceApi: activate.");
        this.thunder.Controller.activate({ callsign: 'org.rdk.VoiceControl' }).then(result => {
          this.thunder.on('org.rdk.VoiceControl', 'onKeywordVerification', notification => {
            this.INFO('VoiceApi: onKeywordVerification ' + JSON.stringify(notification));
            if (this._events.has('onKeywordVerification')) {
              this._events.get('onKeywordVerification')(notification);
            }
          });
          this.thunder.on('org.rdk.VoiceControl', 'onServerMessage', notification => {
            this.INFO('VoiceApi: onServerMessage ' + JSON.stringify(notification));
            if (this._events.has('onServerMessage')) {
              this._events.get('onServerMessage')(notification);
            }
          });
          this.thunder.on('org.rdk.VoiceControl', 'onSessionBegin', notification => {
            this.INFO('VoiceApi: onSessionBegin ' + JSON.stringify(notification));
            if (this._events.has('onSessionBegin')) {
              this._events.get('onSessionBegin')(notification);
            }
          });
          this.thunder.on('org.rdk.VoiceControl', 'onSessionEnd', notification => {
            this.INFO('VoiceApi: onSessionEnd ' + JSON.stringify(notification));
            if (this._events.has('onSessionEnd')) {
              this._events.get('onSessionEnd')(notification);
            }
          });
          this.thunder.on('org.rdk.VoiceControl', 'onStreamBegin', notification => {
            this.INFO('VoiceApi: nStreamBegin ' + JSON.stringify(notification));
            if (this._events.has('onStreamBegin')) {
              this._events.get('onStreamBegin')(notification);
            }
          });
          this.thunder.on('org.rdk.VoiceControl', 'onStreamEnd', notification => {
            this.INFO('VoiceApi: onStreamEnd ' + JSON.stringify(notification));
            if (this._events.has('onStreamEnd')) {
              this._events.get('onStreamEnd')(notification);
            }
          });
          resolve(true);
        }).catch(err => {
          this.ERR('VoiceApi: Error Activation ', err);
        })
      })
    }
    deactivate() {
      return new Promise((resolve, reject) => {
        this.thunder.Controller.deactivate({ callsign: 'org.rdk.VoiceControl' }).then(res => {
          this.INFO("VoiceApi: deactivated org.rdk.VoiceControl")
          resolve(true)
        }).catch(err => {
          this.ERR('VoiceApi: Error deactivation ', err)
        })
      })
    }
    configureVoice(params) {
      return new Promise((resolve, reject) => {
        this.INFO("VoiceApi: configure params:", params);
        this.thunder.call('org.rdk.VoiceControl', 'configureVoice', params).then(result => {
          this.INFO("VoiceApi: configureVoice: "+ JSON.stringify(params) +" result: ",JSON.stringify(result))
          resolve(result);
        }).catch(err => {
          this.ERR("VoiceApi: configureVoice error:", err);
          resolve(false);
        });
      })
    }
    sendVoiceMessage(params) {
      return new Promise((resolve, reject) => {
        this.INFO("VoiceApi: sendVoiceMessage params:", params);
        this.thunder.call('org.rdk.VoiceControl', 'sendVoiceMessage', params).then(result => {
          this.INFO("VoiceApi: sendVoiceMessage result:", JSON.stringify(result))
          resolve(result);
        }).catch(err => {
          this.ERR("VoiceApi: sendVoiceMessage error:", err);
          resolve(false);
        });
      })
    }
    setVoiceInit(params) {
      return new Promise((resolve, reject) => {
        this.INFO("VoiceApi: setVoiceInit params:", params);
        this.thunder.call('org.rdk.VoiceControl', 'setVoiceInit', params).then(result => {
          this.INFO("VoiceApi: setVoiceInit result: ", JSON.stringify(result))
          resolve(result);
        }).catch(err => {
          this.ERR("VoiceApi: setVoiceInit error:", err);
          resolve(false);
        });
      })
    }
    voiceSessionByText(params) {
      return new Promise((resolve, reject) => {
        this.INFO("VoiceApi: voiceSessionByText params:", params);
        this.thunder.call('org.rdk.VoiceControl', 'voiceSessionByText', params).then(result => {
          this.INFO("VoiceApi: voiceSessionByText result: ", JSON.stringify(result))
          resolve(result);
        }).catch(err => {
          this.ERR("VoiceApi: voiceSessionByText error:", err);
          resolve(false);
        });
      })
    }
    voiceSessionTypes() {
      return new Promise((resolve, reject) => {
        this.thunder.call('org.rdk.VoiceControl', 'voiceSessionTypes', params).then(result => {
          this.INFO("VoiceApi: voiceSessionTypes result: ", JSON.stringify(result))
          resolve(result);
        }).catch(err => {
          this.ERR("VoiceApi: voiceSessionTypes error:", err);
          resolve(false);
        });
      })
    }
    voiceSessionRequest(params) {
      return new Promise((resolve, reject) => {
        this.INFO("VoiceApi: voiceSessionRequest params", params);
        this.thunder.call('org.rdk.VoiceControl', 'voiceSessionRequest', params).then(result => {
          this.INFO("VoiceApi: voiceSessionRequest result: ", JSON.stringify(result))
          resolve(result);
        }).catch(err => {
          this.ERR("VoiceApi: voiceSessionRequest error:", err);
          resolve(false);
        });
      })
    }
    voiceSessionTerminate(params) {
      return new Promise((resolve, reject) => {
        this.INFO("VoiceApi: voiceSessionTerminate params:", params);
        this.thunder.call('org.rdk.VoiceControl', 'voiceSessionTerminate', params).then(result => {
          this.INFO("VoiceApi: voiceSessionTerminate result: ", JSON.stringify(result))
          resolve(result);
        }).catch(err => {
          this.ERR("VoiceApi: voiceSessionTerminate error:", err);
          resolve(false);
        });
      })
    }
    voiceSessionAudioStreamStart(params) {
      return new Promise((resolve, reject) => {
        this.INFO("VoiceApi: voiceSessionAudioStreamStart params:", params);
        this.thunder.call('org.rdk.VoiceControl', 'voiceSessionAudioStreamStart', params).then(result => {
          this.INFO("VoiceApi: voiceSessionAudioStreamStart : "+ JSON.stringify(params) +" result: ",JSON.stringify(result))
          resolve(result);
        }).catch(err => {
          this.ERR("VoiceApi: voiceSessionAudioStreamStart error:", err);
          resolve(false);
        });
      })
    }
    voiceStatus() {
      return new Promise((resolve, reject) => {
        this.INFO("VoiceApi: voiceStatus");
        this.thunder.call('org.rdk.VoiceControl', 'voiceStatus').then(result => {
          this.INFO("VoiceApi: voiceStatus result: ",JSON.stringify(result))
          resolve(result);
        }).catch(err => {
          this.ERR("VoiceApi: voiceStatus error:", err);
          resolve(false);
        });
      })
    }
}
