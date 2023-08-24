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
import { Storage } from '@lightningjs/sdk';
import { AlexaLauncherKeyMap, errorPayload, PlaybackStateReport, VolumePayload, ApplicationStateReporter } from '../Config/AlexaConfig';
import VoiceApi from './VoiceApi';
import AppApi from './AppApi';

const config = {
  host: '127.0.0.1',
  port: 9998,
  default: 1,
}
const thunder = ThunderJS(config)
let instance = null

export default class AlexaApi extends VoiceApi {
  static get() {
    if (instance == null) {
      instance = new AlexaApi()
    }
    return instance
  }

  enableSmartScreen() {
    thunder.Controller.activate({callsign: 'SmartScreen'}).then(res => {
      console.log("AlexaAPI: Activate SmartScreen result: " + res);
    }).catch(err => {
      console.error("AlexaAPI: Activate SmartScreen ERROR!: ",err)
    })
  }

  disableSmartScreen() {
    thunder.Controller.deactivate({callsign: 'SmartScreen'}).then(res => {
      console.log("AlexaAPI: Deactivate SmartScreen result: " + res);
    }).catch(err => {
      console.error("AlexaAPI: Deactivate SmartScreen ERROR!: ",err)
    })
  }

  displaySmartScreenOverlay(focused = false, opacity = 100, visible = true) {
    let appApi = new AppApi();
    appApi.zorder("SmartScreen");
    appApi.setOpacity("SmartScreen", opacity);
    appApi.visible("SmartScreen", visible);
    if (focused) { appApi.setFocus("SmartScreen") }
  }

  reportApplicationState(app = "Menu", isRoute = false) {
    /* retrieve 'app' matching from AlexaLauncherKeyMap. */
    for (let [key, value] of Object.entries(AlexaLauncherKeyMap)) {
      if (isRoute && value.hasOwnProperty("route") && (value.route === app)) {
        ApplicationStateReporter.msgPayload.event.header.value.foregroundApplication.id = key;
        if (app.toLowerCase() === "menu")
          ApplicationStateReporter.msgPayload.event.header.value.foregroundApplication.metadata.isHome = true;
        break;
      } else if (!isRoute && (value.callsign === app)) {
        ApplicationStateReporter.msgPayload.event.header.value.foregroundApplication.id = key;
        ApplicationStateReporter.msgPayload.event.header.value.foregroundApplication.metadata.isHome = false;
        break;
      }
    }
    /* Send the new app state object. */
    console.log("Sending app statereport to Alexa:", ApplicationStateReporter);
    this.sendVoiceMessage(ApplicationStateReporter);
  }

  reportVolumeState(volumeLevel = undefined, muteStatus = undefined, messageId = undefined) {
    if (volumeLevel != undefined)
      VolumePayload.msgPayload.event.payload.volume = volumeLevel
    if (muteStatus != undefined)
      VolumePayload.msgPayload.event.payload.muted = muteStatus
    if (messageId != undefined)
      VolumePayload.msgPayload.event.header.messageId = messageId
    console.log("Sending volume statereport to Alexa:", VolumePayload);
    this.sendVoiceMessage(VolumePayload);
  }

  updateDeviceLanguageInAlexa(updatedLanguage) {
    let updatedLan = []
    updatedLan.push(updatedLanguage)
    let payload = { "msgPayload": { "DeviceSettings": "Set Device Settings", "values": { "locale": updatedLan } } }
    console.log("Sending language statereport to Alexa:", updatedLan);
    this.sendVoiceMessage(payload);
  }

  //reportDeviceTimeZone(updatedTimeZone) {
  updateDeviceTimeZoneInAlexa(updatedTimeZone) {
    console.log("updateDeviceTimeZoneInAlexa sending :" + updatedTimeZone)
    let payload = {"msgPayload":{"DeviceSettings":"Set Device Settings","values":{ "timezone": updatedTimeZone }}}
    this.sendVoiceMessage(payload);
  }

  reportErrorState(directive, type = "ENDPOINT_UNREACHABLE", message = "ENDPOINT_UNREACHABLE") {
    errorPayload.msgPayload.event.payload.type = type
    errorPayload.msgPayload.event.payload.message = message
    errorPayload.msgPayload.event.header.correlationToken = directive.header.correlationToken
    errorPayload.msgPayload.event.header.payloadVersion = directive.header.payloadVersion
    errorPayload.msgPayload.event.endpoint.endpointId = directive.endpoint.endpointId
    errorPayload.msgPayload.event.header.messageId = directive.header.messageId
    console.log("AlexaAPI: reportErrorState payload:", errorPayload)
    this.sendVoiceMessage(errorPayload);
  }

  reportPlaybackState(state = "STOPPED") {
    PlaybackStateReport.msgPayload.event.header.value = state;
    console.log("AlexaAPI: reportPlaybackState payload:", PlaybackStateReport)
    this.sendVoiceMessage(PlaybackStateReport);
  }

  getAlexaDeviceSettings() {
    this.sendVoiceMessage({"msgPayload":{"DeviceSettings":"Get Device Settings"}});
  }

  /**
   * Function to send voice message.
   */
  resetAVSCredentials() {
    return new Promise((resolve) => {
      Storage.set("AlexaVoiceAssitantState", "AlexaAuthPending");
      thunder.Controller.activate({callsign: 'SmartScreen'}).then(res => {
        console.log("AlexaAPI: resetAVSCredentials activating SmartScreen instance.")
      }).catch(err => {
        console.error("AlexaAPI: resetAVSCredentials activate SmartScreen ERROR!: ",err)
      })
      this.sendVoiceMessage({"msgPayload":{"event": "ResetAVS"}}).then(result => {
        resolve(result)
      }).catch(err => {
        resolve(false)
      })
    });
  }

  /**
   * User can opt out Alexa; could be in Auth state or Some generic Alexa Error after Auth completed.
   * Return respective map so that logic can be drawn based on that.
   */
  checkAlexaAuthStatus(){
    if (Storage.get("AlexaVoiceAssitantState") === undefined || Storage.get("AlexaVoiceAssitantState") === null || Storage.get("AlexaVoiceAssitantState") === "AlexaAuthPending")
      return "AlexaAuthPending"; // Do not handle Alexa Related Errors; only Handle its Auth status.
    else
      return Storage.get("AlexaVoiceAssitantState"); // Return the stored value of AlexaVoiceAssitantState
  }

  setAlexaAuthStatus(newState = false){
    Storage.set("AlexaVoiceAssitantState", newState)
    if (newState === "AlexaUserDenied") {
      this.configureVoice({ "enable": false });
      /* Free up Smartscreen resources */
      thunder.Controller.deactivate({callsign: 'SmartScreen'}).then(res => {
        console.log("AlexaAPI: deactivated SmartScreen instance.")
      }).catch(err => {
        console.error("AlexaAPI: deactivate SmartScreen ERROR!: ",err)
      })
    } else {
      this.configureVoice({ "enable": true });
    }
    console.warn("setAlexaAuthStatus with ", newState)
  }

  /**
   * To track playback state of Alexa Smartscreen App(AmazonMusic or anything else)
   */
  checkAlexaSmartscreenAudioPlaybackState(){
    if (Storage.get("AlexaSmartscreenAudioPlaybackState") === null || Storage.get("AlexaSmartscreenAudioPlaybackState") === "null")
      return "stopped"; // Assume default state.
    else
      return Storage.get("AlexaSmartscreenAudioPlaybackState");
  }
  setAlexaSmartscreenAudioPlaybackState(newState = false){
    Storage.set("AlexaSmartscreenAudioPlaybackState", newState)
    console.log("setAlexaSmartscreenAudioPlaybackState with ", newState)
  }
}
