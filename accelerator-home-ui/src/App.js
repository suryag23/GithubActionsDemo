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
import { Utils, Router, Storage, Settings } from '@lightningjs/sdk';
import ThunderJS from 'ThunderJS';
import routes from './routes/routes';
import AppApi from '../src/api/AppApi.js';
import XcastApi from '../src/api/XcastApi';
import { CONFIG, availableLanguages, availableLanguageCodes } from './Config/Config';
import Keymap from './Config/Keymap';
import Menu from './views/Menu'
import Failscreen from './screens/FailScreen';
import { keyIntercept } from './keyIntercept/keyIntercept';
import HDMIApi from './api/HDMIApi';
import Volume from './tvOverlay/components/Volume';
import DTVApi from './api/DTVApi';
import TvOverlayScreen from './tvOverlay/TvOverlayScreen';
import ChannelOverlay from './MediaPlayer/ChannelOverlay';
import SettingsOverlay from './overlays/SettingsOverlay';
import { AlexaLauncherKeyMap, errorPayload, PlaybackStateReport, VolumePayload, ApplicationStateReporter} from './Config/AlexaConfig';
import AppCarousel from './overlays/AppCarousel';
import VideoScreen  from './screens/Video';
import VideoInfoChange from './overlays/VideoInfoChange/VideoInfoChange.js';
import Failscreen1 from './screens/FailScreen';
import CECApi from './api/CECApi';
import { appListInfo } from "./../static/data/AppListInfo.js";

const config = {
  host: '127.0.0.1',
  port: 9998,
  default: 1,
};
var powerState = 'ON';
var AlexaAudioplayerActive = false;
var thunder = ThunderJS(config);
var appApi = new AppApi();
var dtvApi = new DTVApi();
var hdmiApi = new HDMIApi()
var cecApi = new CECApi();
var xcastApi = new XcastApi();


export default class App extends Router.App {
  static getFonts() {
    return [{ family: CONFIG.language.font, url: Utils.asset('fonts/' + CONFIG.language.fontSrc) }];
  }
  _setup() {
    console.log("accelerator-home-ui version: " + Settings.get("platform", "version"))
    Router.startRouter(routes, this);
    Storage.set("ResolutionChangeInProgress", false);
    document.onkeydown = e => {
      if (e.keyCode == Keymap.Backspace) {
        e.preventDefault();
      }
    };

    function updateAddress() {
      if (window.navigator.onLine) {
        console.log(`is online`);
      }
      else {
        Storage.set("ipAddress", null);
        console.log(`is offline`)
      }
    }
    window.addEventListener("offline", updateAddress)
  }

  static _template() {
    return {
      Pages: {
        // this hosts all the pages
        forceZIndexContext: true
      },
      Widgets: {
        VideoInfoChange:{
          type:VideoInfoChange
        },
        Menu: {
          type: Menu
        },
        Fail: {
          type: Failscreen,
        },
        Volume: {
          type: Volume
        },
        TvOverlays: {
          type: TvOverlayScreen
        },
        ChannelOverlay: {
          type: ChannelOverlay
        },
        SettingsOverlay: {
          type: SettingsOverlay
        },
        AppCarousel:{
          type:AppCarousel
        }
      },
      VideoScreen:{
        alpha:0,
        w: 2000,
        h: 1500,
        zIndex: 999,
       type:VideoScreen
        },
        Failscreen1:{
          alpha:0,
          type: Failscreen1
        },
      ScreenSaver:{
        alpha:0,
        w: 2000,
        h: 1500,
        zIndex: 999,
        src: Utils.asset('images/tvShows/fantasy-island.jpg')
      }
    }
  }

  static language() {
    return {
      file: Utils.asset('language/language-file.json'),
      language: CONFIG.language.id
    }
  }

  $updateTimeZone(timezone) {
    this.tag('Menu').updateTimeZone(timezone)
  }

  _captureKey(key) {
    let self = this;
    console.log(key, key.keyCode)
    this.$hideImage(0);
    if (key.keyCode == Keymap.Home) {
      this.jumpToRoute("menu"); //method to exit the current app(if any) and route to home screen
      return true
    }
    else if (key.keyCode == Keymap.Inputs_Shortcut) { //for inputs overlay
      if (Storage.get("applicationType") !== "") {
        if (Router.getActiveHash() === "tv-overlay/inputs") {
          Router.reload();
        } else {
          Router.navigate("tv-overlay/inputs", false);
        }
        // appApi.setVisibility('ResidentApp', true);
        thunder.call('org.rdk.RDKShell', 'moveToFront', {
          client: 'ResidentApp'
        }).then(result => {
          appApi.setVisibility('ResidentApp', true); //#requiredChange
          console.log('ResidentApp moveToFront Success');
          thunder
            .call("org.rdk.RDKShell", "setFocus", {
              client: 'ResidentApp'
            })
            .then((result) => {
              console.log("residentApp setFocus Success");
            })
            .catch((err) => {
              console.log("Error", err);
            });
        });
      } else {
        if (Router.getActiveHash() === "dtvplayer") {
          Router.focusWidget('TvOverlays');
          Router.getActiveWidget()._setState("OverlayInputScreen")
        }
      }
      return true
    }
    else if (key.keyCode == Keymap.Picture_Setting_Shortcut) { //for video settings overlay
      if (Storage.get("applicationType") !== "") {
        if (Router.getActiveHash() === "tv-overlay/settings") {
          Router.reload();
        } else {
          Router.navigate("tv-overlay/settings", false);
        }
        // appApi.setVisibility('ResidentApp', true);
        thunder.call('org.rdk.RDKShell', 'moveToFront', {
          client: 'ResidentApp'
        }).then(result => {
          appApi.setVisibility('ResidentApp', true); //#requiredChange
          console.log('ResidentApp moveToFront Success');
          thunder
            .call("org.rdk.RDKShell", "setFocus", {
              client: 'ResidentApp'
            })
            .then((result) => {
              console.log("Resident App setFocus Success");
            })
            .catch((err) => {
              console.log("Error", err);
            });
        });
      } else {
        if (Router.getActiveHash() === "dtvplayer") {
          Router.focusWidget('TvOverlays');
          Router.getActiveWidget()._setState("OverlaySettingsScreen")
        }
      }
      return true;
    }
    else if (key.keyCode == Keymap.Settings_Shortcut) {
      console.log(`settings shortcut`)
      if (Storage.get("applicationType") === "") { //launch settings overlay/page depending on the current route.
        if(Router.getActiveHash() === "player" || Router.getActiveHash() === "dtvplayer" || Router.getActiveHash() === "usb/player"){ //player supports settings overlay, so launch it as overlay
          if (Router.getActiveWidget() && Router.getActiveWidget().__ref === "SettingsOverlay") { //currently focused on settings overlay, so hide it
            Router.focusPage();
          }
          else { //launch the settings overlay
            Router.focusWidget('SettingsOverlay');
          }
        } else { //navigate to settings page for all other routes
          Router.navigate("settings")
        }
      } else { //currently on some application
        if(Router.getActiveHash() === "applauncher"){ //if route is applauncher just focus the overlay widget
          if (Router.getActiveWidget() && Router.getActiveWidget().__ref === "SettingsOverlay") { //currently focused on settings overlay, so hide it
            Router.focusPage();
            let currentApp = Storage.get("applicationType")
            appApi.zorder(currentApp)
            appApi.setFocus(currentApp)
            appApi.setVisibility(currentApp, true)
          }
          else { //launch the settings overlay
            appApi.zorder("ResidentApp")
            appApi.setFocus("ResidentApp")
            appApi.setVisibility("ResidentApp", true)
            Router.focusWidget('SettingsOverlay');
          }
        } else { //if on some other route while on an application, route to applauncher before launching the settings overlay
          appApi.zorder("ResidentApp")
          appApi.setFocus("ResidentApp")
          appApi.setVisibility("ResidentApp", true)
          Router.navigate("applauncher");
          Router.focusWidget('SettingsOverlay');
        }
      }
      return true;
    }
    else if (key.keyCode == Keymap.Guide_Shortcut) {
      Router.navigate('epg')
      return true
    }
    else if (key.keyCode == Keymap.Amazon) {
      let params = {
        launchLocation: "dedicatedButton",
        appIdentifier: self.appIdentifiers["Amazon"]
      }
      appApi.launchApp( "Amazon" , params).catch(err => {
        console.error("Error in launching Amazon via dedicated key: " + JSON.stringify(err))
      });
      return true
    }
    else if (key.keyCode == Keymap.Youtube) {
      let params = {
        launchLocation: "dedicatedButton",
        appIdentifier:self.appIdentifiers["YouTube"]
      }
      appApi.launchApp( "YouTube" , params).catch(err => {
        console.error("Error in launching Youtube via dedicated key: " + JSON.stringify(err))
      });
      return true
    }
    else if (key.keyCode == Keymap.Netflix) { //launchLocation mapping is in launchApp method in AppApi.js
      let params = {
        launchLocation: "dedicatedButton",
        appIdentifier:self.appIdentifiers["Netflix"]
      }
      appApi.launchApp( "Netflix" , params).catch(err => {
        console.error("Error in launching Netflix via dedicated key: " + JSON.stringify(err))
      });
      return true
    }
    else if(key.keyCode == Keymap.AppCarousel) {
      if (Storage.get("applicationType") === "") { // if resident app is on focus
        if(Router.getActiveHash() === "menu"){
          return true;
        }
        else if (Router.getActiveWidget() && Router.getActiveWidget().__ref === "AppCarousel") { //currently focused on appcarousel, so hide it
          Router.focusPage();
        }
        else { //launch the app carousel
          Router.focusWidget("AppCarousel")
        }
      } else { //currently on some application
        if(Router.getActiveHash() === "applauncher"){ //if route is applauncher just focus the overlay widget
          if (Router.getActiveWidget() && Router.getActiveWidget().__ref === "AppCarousel") { //currently focused on settings overlay, so hide it
            Router.focusPage();
            let currentApp = Storage.get("applicationType")
            appApi.zorder(currentApp)
            appApi.setFocus(currentApp)
            appApi.setVisibility(currentApp, true)
          }
          else { //launch the settings overlay
            appApi.zorder("ResidentApp")
            appApi.setFocus("ResidentApp")
            appApi.setVisibility("ResidentApp", true)
            Router.focusWidget('AppCarousel');
          }
        } else { //if on some other route while on an application, route to applauncher before launching the settings overlay
          appApi.zorder("ResidentApp")
          appApi.setFocus("ResidentApp")
          appApi.setVisibility("ResidentApp", true)
          Router.navigate("applauncher");
          Router.focusWidget('AppCarousel');
        }
      }
      return true
    }
    else if (key.keyCode == Keymap.Power) {
      // Remote power key and keyboard F1 key used for STANDBY and POWER_ON
      appApi.getPowerState().then(res => {
        console.log("getPowerState: ",res)
        if(res.success){
          if(res.powerState === "ON") {
            console.log("current powerState is ON so setting power state to LIGHT_SLEEP/DEEP_SLEEP depending of preferred option");
            appApi.getPreferredStandbyMode().then(res => {
              console.log("getPreferredStandbyMode: ",res.preferredStandbyMode);
              appApi.setPowerState(res.preferredStandbyMode).then(result => {
                if(result.success){
                  console.log("successfully set powerstate to: " + res.preferredStandbyMode)
                }
              })
            })
          } else {
            console.log("current powerState is "+ res.powerState + " so setting power state to ON");
            appApi.setPowerState("ON").then(res => {
              if(res.success){
                console.log("successfully set powerstate to: ON")
              }
            })
          }
        }
      })
    } else if (key.keyCode == 228) {
      console.log("___________DEEP_SLEEP_______________________F12")
      appApi.setPowerState("DEEP_SLEEP").then(res => {
        powerState = 'DEEP_SLEEP'
      })
      return true
    } else if (key.keyCode === Keymap.AudioVolumeMute) {
      if (Storage.get('applicationType') === ''){
        this.tag("Volume").onVolumeMute();
      } else {
        console.log("muting on some app")
        if(Router.getActiveHash() === "applauncher"){
          console.log("muting on some app while route is app launcher")
          appApi.zorder("ResidentApp")
          appApi.visible("ResidentApp", true)
          this.tag("Volume").onVolumeMute();
        } else  {
          console.log("muting on some app while route is NOT app launcher")
          appApi.zorder("ResidentApp")
          appApi.visible("ResidentApp", true)
          Router.navigate("applauncher");
          this.tag("Volume").onVolumeMute();
        }
      }
      return true
    } else if (key.keyCode == Keymap.AudioVolumeUp) {
      if (Storage.get('applicationType') === ''){
        this.tag("Volume").onVolumeKeyUp();
      } else {
        console.log("muting on some app")
        if(Router.getActiveHash() === "applauncher"){
          console.log("muting on some app while route is app launcher")
          appApi.zorder("ResidentApp")
          appApi.visible("ResidentApp", true)
          this.tag("Volume").onVolumeKeyUp();
        } else  {
          console.log("muting on some app while route is NOT app launcher")
          appApi.zorder("ResidentApp")
          appApi.visible("ResidentApp", true)
          Router.navigate("applauncher");
          this.tag("Volume").onVolumeKeyUp();
        }
      }
      return true
    } else if (key.keyCode == Keymap.AudioVolumeDown) {
      if (Storage.get('applicationType') === ''){
        this.tag("Volume").onVolumeKeyDown();
      } else {
        console.log("muting on some app")
        if(Router.getActiveHash() === "applauncher"){
          console.log("muting on some app while route is app launcher")
          appApi.zorder("ResidentApp")
          appApi.visible("ResidentApp", true)
          this.tag("Volume").onVolumeKeyDown();
        } else  {
          console.log("muting on some app while route is NOT app launcher")
          appApi.zorder("ResidentApp")
          appApi.visible("ResidentApp", true)
          Router.navigate("applauncher");
          this.tag("Volume").onVolumeKeyDown();
        }
      }
      return true
    }
    return false
  }

  _moveToFront() {
    appApi.setVisibility('ResidentApp', true)
    appApi.zorder('residentApp')
  }

  AvDecodernotificationcall(){
    thunder.on('org.rdk.DeviceDiagnostics', 'onAVDecoderStatusChanged', notification => {
      console.log(new Date().toISOString() + "AvDecoderStatusNotification: ", JSON.stringify(notification))
    })
  }

  async userInactivity(){
    let persisteneTimerValue = await appApi.getTimerValue();
    console.log("persistenceTimer", persisteneTimerValue)
     if(persisteneTimerValue === "undefined" || persisteneTimerValue === undefined ||persisteneTimerValue === "Off"){
      appApi.enabledisableinactivityReporting(false).then(resp =>{
        this.userInactivity.dispose();
      })
    }
    else{
      console.log("came else block")
     this.setTimerValuethroughPersistence(parseInt(persisteneTimerValue))
    }
  }

  setTimerValuethroughPersistence(persisteneTimerValue){
    appApi.enabledisableinactivityReporting(true).then(resp =>{
      console.log("enable",resp)
      appApi.setInactivityInterval(persisteneTimerValue).then(resp =>{
        this.userInactivity =thunder.on('org.rdk.RDKShell', 'onUserInactivity', notification => {
          console.log("UserInactivityStatusNotification: ", JSON.stringify(notification))
          appApi.getAvCodeStatus().then(result =>{
            console.log("Avdecoder", result.avDecoderStatus);
            if((result.avDecoderStatus === "IDLE" || result.avDecoderStatus === "PAUSE") && Storage.get("applicationType") === ""){
              this.$hideImage(1);
            }
          })
        })
      })
    });
  }

  $hideImage(alpha){
    if(alpha === 1){
      this.tag("Widgets").visible = false;
      this.tag("Pages").visible = false;
    }
    else{
    this.tag("Widgets").visible = true;
    this.tag("Pages").visible = true;
  }
    this.tag("VideoScreen").alpha = alpha;
   // this.tag("ScreenSaver").alpha = alpha;
  }
  _init() {
    let self = this;
    self.appIdentifiers = {
      "YouTubeKids":"n:5",
      "YouTubeTV":"n:4",
      "YouTube": "n:3",
      "Netflix": "n:1",
      "Amazon Prime": "n:2",
      "Amazon":"n:2",
      "Prime":"n:2"
    }
    this.userInactivity();
    appApi.deviceType().then(result => {
      console.log("App detected deviceType as:", ((result.devicetype != null)?result.devicetype:"tv"));
      Storage.set("deviceType", ((result.devicetype != null)?result.devicetype:"tv"));
    });
    appApi.getPluginStatus("org.rdk.DeviceDiagnostics").then(res =>{
      console.log("App DeviceDiagnostics state:", res[0].state)
      if(res[0].state === "deactivated"){
        thunder.Controller.activate({ callsign: 'org.rdk.DeviceDiagnostics' }).then(result => {
          this.AvDecodernotificationcall();
        }).catch(err => {
          reject(err)
        })
      }
      else{
        this.AvDecodernotificationcall();
      }
    })

    appApi.getHDCPStatus().then(result => {
      Storage.set("UICacheonDisplayConnectionChanged", result.isConnected);
    })

    if (Storage.get("applicationType") !== "HDMI") { //to default to hdmi, if previous input was hdmi
      Storage.set('applicationType', '');//to set the application type to none
    }
    Storage.set("lastVisitedRoute", "menu"); //setting to menu so that it will be always defaulted to #menu
    appApi.enableDisplaySettings().then(res => { console.log(`results : ${JSON.stringify(res)}`) }).catch(err => { console.error("error while enabling displaysettings") })
    appApi.cobaltStateChangeEvent()

    this.xcastApi = new XcastApi()
    this.xcastApi.activate().then(result => {
      let serialNumber;
      try {
        appApi.getSerialNumber().then(res => {
          serialNumber = res;
          console.log("App getSerialNumber result:", serialNumber);
          appApi.getModelName().then(modelName => {
            let friendlyName = modelName + "_" + serialNumber;
            this.xcastApi.setFriendlyName(friendlyName).then(result => {
              console.log("App XCAST setFriendlyName result:", result);
            }).catch(error => {
              console.error("App Error setting friendlyName:", error);
            });
          }).catch(error => {
            console.error("App Error retrieving modelName:", error);
          });
        }).catch(error => {
          console.error("App Error getSerialNumber:", error);
        });
      } catch (error) {
        console.log(error);
      }
      if (result) {
        this.registerXcastListeners()
      }
    })

    keyIntercept()
    if (!availableLanguages.includes(localStorage.getItem('Language'))) {
      localStorage.setItem('Language', 'English')
    }

    thunder.on('Controller.1', 'all', noti => {
      console.log("App controller notification:", noti)
      if ((noti.data.url && noti.data.url.slice(-5) === "#boot") || (noti.data.httpstatus && noti.data.httpstatus != 200 && noti.data.httpstatus != -1 )) { // to exit metro apps by pressing back key & to auto exit webapp if httpstatus is not 200
        appApi.exitApp(Storage.get('applicationType'));
      }
      // TODO: make the check based on XcastApi.supportedApps() list
      if (noti.hasOwnProperty("callsign") && (noti.callsign.startsWith("YouYube") || noti.callsign.startsWith("Amazon") || noti.callsign.startsWith("Netflix"))) {
        let params = { applicationName: noti.callsign, state: 'stopped' };
        switch(noti.data.state) {
          case "activated":
          case "resumed":
            params.state = 'running';
            break;
          case "Activation":
          case "deactivated":
          case "Deactivation":
            params.state = 'stopped';
            break;
          case "suspended":
            params.state = 'suspended';
          case "Precondition":
            break;
        }
        if (noti.callsign.startsWith("Amazon")) {
          params.applicationName = "AmazonInstantVideo";
        }
        console.log("App Controller state change to xcast: ", JSON.stringify(params));
        this.xcastApi.onApplicationStateChanged(params);
        params = null;
      }
    })

    appApi.getPluginStatus("Cobalt").then(res => {
      /* Loop through YouTube variants and set respective urls. */
      JSON.parse(JSON.stringify(appListInfo)).forEach(appInfo => {
        if (appInfo.hasOwnProperty("applicationType") && appInfo.applicationType.startsWith("YouTube") && appInfo.hasOwnProperty("uri") && appInfo.uri.length) {
          thunder.Controller.clone({callsign:"Cobalt", newcallsign:appInfo.applicationType}).then(result => {
            console.log("App Controller.clone Cobalt as "+appInfo.applicationType+" done.", result);
          }).catch(err => {
            console.error("App Controller clone Cobalt for "+appInfo.applicationType+" failed: ", err);
            // TODO: hide YouTube Icon and listing from Menu, AppCarousel, Channel overlay and EPG page.
          })

          appApi.getPluginStatus(appInfo.applicationType).then(res => {
            if (res[0].state !== "deactivated") {
              thunder.Controller.deactivate({ callsign:appInfo.applicationType}).catch(err => {
                console.error("App Controller.deactivate "+appInfo.applicationType+" failed. It may not work.", err);
                resolve(false);
              })
            }
            /* Do not change YouTube's configuration as Page-visibility test runs on that. */
            if (res[0].callsign !== "YouTube") {
              thunder.call('Controller', `configuration@${appInfo.applicationType}`).then(result => {
                /* Ensure appending '?' so that later params can be directly appended. */
                result.url = appInfo.uri + "?"; // Make sure that appListInfo.js has only base url.
                thunder.call('Controller', `configuration@${appInfo.applicationType}`, result).then(result => {
                  Storage.set(appInfo.applicationType+"DefaultURL", appInfo.uri + "?"); // Make sure that appListInfo.js has only base url.
                }).catch(err =>{
                  console.error("App Controller.configuration@" +appInfo.applicationType+" set failed. It may not work.", err);
                  resolve(false);
                })
              }).catch(err => {
                console.error("App Controller.configuration@" +appInfo.applicationType+" get failed. It may not work.", err);
                resolve(false);
              })
            } else {
              /* Just store the plugin configured url as default url and ensure '?' is appended. */
              Storage.set(appInfo.applicationType+"DefaultURL", (res[0].configuration.url.includes('?')?res[0].configuration.url:res[0].configuration.url+"?"));
            }
          }).catch(err => {
            console.error("App getPluginStatus "+appInfo.applicationType+" Error: " + err);
            resolve(false);
          })
        }
      });
    }).catch(err => {
      console.error("App getPluginStatus Cobalt error: ",err);
    })

    thunder.on('org.rdk.RDKShell', 'onApplicationDisconnected', notification => {
      console.log("onApplicationDisconnectedNotification: ", JSON.stringify(notification))
      // DO NOT HANDLE THIS, see RDKUI-474 for details.
      // if (notification.hasOwnProperty("client") && (Storage.get("applicationType").includes(notification.client))) {
      //   appApi.exitApp(Storage.get("applicationType"));
      // }
    })

    //video info change events begin here---------------------

    thunder.on('org.rdk.tv.ControlSettings.1', 'videoFormatChanged', notification => {
      console.log("videoFormatChangedNotification: ", JSON.stringify(notification))
      if(Router.getActiveWidget() == this.widgets.videoinfochange){
        this.widgets.videoinfochange.update( " New videoFormat :  " + notification.currentVideoFormat , true)
      }
      else{
        Router.focusWidget("VideoInfoChange")
        this.widgets.videoinfochange.update(" New videoFormat :  " + notification.currentVideoFormat )
      }
    })

    thunder.on('org.rdk.tv.ControlSettings.1', 'videoFrameRateChanged', notification => {
      console.log("videoFrameRateChangedNotification: ", JSON.stringify(notification))
      if(Router.getActiveWidget() == this.widgets.videoinfochange){
        this.widgets.videoinfochange.update(" New videoFrameRate :  " + notification.currentVideoFrameRate , true)
      }
      else{
        Router.focusWidget("VideoInfoChange")
        this.widgets.videoinfochange.update(" New videoFrameRate :  " + notification.currentVideoFrameRate )
      }
    })

    thunder.on('org.rdk.tv.ControlSettings.1', 'videoResolutionChanged', notification => {
      console.log("videoResolutionChangedNotification: ", JSON.stringify(notification))
      if(Router.getActiveWidget() == this.widgets.videoinfochange){
        this.widgets.videoinfochange.update( " New video resolution :  " + notification.currentVideoFormat , true)
      }
      else{
        Router.focusWidget("VideoInfoChange")
        this.widgets.videoinfochange.update(" New video resolution :  " + notification.currentVideoFormat)
      }
    })

    thunder.on('Controller', 'statechange', notification => {
      // get plugin status
      console.log("Controller statechange Notification : " + JSON.stringify(notification))
      if (notification && (notification.callsign.startsWith("YouTube") || notification.callsign === 'Amazon' || notification.callsign === 'LightningApp' || notification.callsign === 'HtmlApp' || notification.callsign === 'Netflix') && (notification.state == 'Deactivation' || notification.state == 'Deactivated')) {
        console.log(`${notification.callsign} status = ${notification.state}`)
        console.log(">>notification.callsign: ", notification.callsign, " applicationType: ", Storage.get("applicationType"));
        if (Router.getActiveHash().startsWith("tv-overlay") || Router.getActiveHash().startsWith("overlay") || Router.getActiveHash().startsWith("applauncher")) { //navigate to last visited route when exiting from any app
          console.log("navigating to lastVisitedRoute")
          Router.navigate(Storage.get("lastVisitedRoute"));
        }
        if (notification.callsign === Storage.get("applicationType")) { //only launch residentApp iff notification is from currentApp
          console.log(notification.callsign + " is in: " + notification.state + " state, and application type in Storage is still: " + Storage.get("applicationType") + " calling launchResidentApp")
          appApi.launchResidentApp();
        }
      }
      if (notification && (notification.callsign === 'org.rdk.HdmiCec_2' && notification.state === 'Activated')) {
        this.advanceScreen = Router.activePage()
        if (typeof this.advanceScreen.performOTPAction === 'function') {
          console.log('otp action')
          this.advanceScreen.performOTPAction()
        }
      }

      if (notification && (notification.callsign.startsWith("YouTube") || notification.callsign === 'Amazon' || notification.callsign === 'LightningApp' || notification.callsign === 'HtmlApp' || notification.callsign === 'Netflix') && notification.state == 'Activated') {
        Storage.set('applicationType', notification.callsign) //required in case app launch happens using curl command.
        if (notification.callsign === 'Netflix') {
          appApi.getNetflixESN()
            .then(res => {
              Storage.set('Netflix_ESN', res)
            })
          thunder.on('Netflix', 'notifyeventchange', notification => {
            console.log(`NETFLIX : notifyEventChange notification = `, JSON.stringify(notification));
            if (notification.EventName === "rendered") {
              Router.navigate('menu')
              if (Storage.get("NFRStatus")) {
                thunder.call("Netflix.1", "nfrstatus", { "params": "enable" }).then(nr => {
                  console.log(`Netflix : nfr enable results in ${nr}`)
                }).catch(nerr => {
                  console.error(`Netflix : error while updating nfrstatus ${nerr}`)
                })
              } else {
                thunder.call("Netflix.1", "nfrstatus", { "params": "disable" }).then(nr => {
                  console.log(`Netflix : nfr disable results in ${nr}`)
                }).catch(nerr => {
                  console.error(`Netflix : error while updating nfrstatus ${nerr}`)
                })
              }

              appApi.visible('ResidentApp', false);
            }
            if (notification.EventName === "requestsuspend") {
              this.deactivateChildApp('Netflix')
            }
            if (notification.EventName === "updated") {
              console.log(`Netflix : xxxxxxxxxxxxxxxxxx Updated Event Trigger xxxxxxxxxxxxxxxxxxxx`)
              appApi.getNetflixESN()
                .then(res => {
                  Storage.set('Netflix_ESN', res)
                })
            }
          })
        } else {
          appApi.setFocus(notification.callsign) //required in case app launch happens using curl command.
        }
      }
    });

  /********************   RDKUI-341 CHANGES - DEEP SLEEP/LIGHT SLEEP **************************/


    let cachedPowerState = Storage.get('SLEEPING');
    console.log('cached power state' ,cachedPowerState)
    console.log(typeof cachedPowerState)
    if(cachedPowerState){
      appApi.getWakeupReason().then(result => {
        if(result.result.wakeupReason !== 'WAKEUP_REASON_UNKNOWN')
        {
          cachedPowerState='ON'
        }
      })
      appApi.setPowerState(cachedPowerState).then(result => {
        if(result.success){
          console.log("successfully set powerstate to: " + cachedPowerState)
        }
      })
    }

  /********************   RDKUI-303 - PAGE VISIBILITY API **************************/

  //ACTIVATING HDMI CEC PLUGIN
  cecApi.activate().then((res) => {
    let getfriendlyname,getosdname;
    setTimeout(() => {
      xcastApi.getFriendlyName().then(res =>{
        getfriendlyname = res.friendlyname;
        console.log("XcastApi getFriendlyName :"+getfriendlyname);
      }).catch(err => {
        console.error('XcastApi getFriendlyName Error: ', err);
      })
      cecApi.getOSDName().then(result =>{
        getosdname = result.name;
        console.log("CECApi getOSDName :"+getosdname);
        if(getfriendlyname !== getosdname) {
          cecApi.setOSDName(getfriendlyname);
        }
      }).catch(err => {
        console.error('CECApi getOSDName Error :', err);
      })
    }, 5000);
    cecApi.getActiveSourceStatus().then((res)=>{
      Storage.set("UICacheCECActiveSourceStatus", res);
      console.log("App getActiveSourceStatus: " +res+ " UICacheCECActiveSourceStatus:" +Storage.get("UICacheCECActiveSourceStatus"));
    });
  }).catch((err) => console.log(err))


  //UNPLUG/PLUG HDMI

  thunder.on("org.rdk.HdcpProfile", "onDisplayConnectionChanged", notification => {
    console.log(new Date().toISOString() + " onDisplayConnectionChanged ", notification.HDCPStatus)
    let temp = notification.HDCPStatus
    if (!Storage.get("ResolutionChangeInProgress") && (temp.isConnected != Storage.get("UICacheonDisplayConnectionChanged"))) {
      if(temp.isConnected){
        let currentApp = Storage.get('applicationType')
        let launchLocation = Storage.get(currentApp+"LaunchLocation")
        console.log("App HdcpProfile onDisplayConnectionChanged current app is:", currentApp)
        let params = {
          launchLocation: launchLocation,
          appIdentifier: self.appIdentifiers[currentApp]
        }
        if(currentApp.startsWith("YouTube")){
          params["url"] = Storage.get(currentApp+"DefaultURL");
          appApi.getPluginStatus(currentApp).then(result => {
            if(result[0].state === (Settings.get("platform", "enableAppSuspended")? "suspended":"deactivated")) {
              appApi.launchApp(currentApp, params).catch(err => {
                console.error(`Error in launching ${currentApp} : ` + JSON.stringify(err))
              });
            } else {
              console.log("App HdcpProfile onDisplayConnectionChanged skipping; "+currentApp+" is already: ", JSON.stringify(result[0].state));
            }
          })
        }
      }
      else{
        let currentApp = Storage.get('applicationType')
        if(currentApp.startsWith("YouTube")){
          appApi.getPluginStatus(currentApp).then(result => {
            if(result[0].state !== (Settings.get("platform", "enableAppSuspended")? "suspended":"deactivated")) {
              appApi.exitApp(currentApp, true)
            } else {
              console.log("App HdcpProfile onDisplayConnectionChanged skipping; "+currentApp+" is already: ", JSON.stringify(result[0].state));
            }
          })
        }
      }
      Storage.set("UICacheonDisplayConnectionChanged", temp.isConnected)
    } else {
      console.warn("App HdcpProfile onDisplayConnectionChanged discarding.");
      console.log("App HdcpProfile ResolutionChangeInProgress: " + Storage.get("ResolutionChangeInProgress") + " UICacheonDisplayConnectionChanged: " + Storage.get("UICacheonDisplayConnectionChanged"));
    }
  })

  //CHANGING HDMI INPUT PORT

  thunder.on("org.rdk.HdmiCec_2", "onActiveSourceStatusUpdated", notification => {
    console.log(new Date().toISOString() + " onActiveSourceStatusUpdated ", notification)
    if(notification.status != Storage.get("UICacheCECActiveSourceStatus")){
      if (notification.status){
        let currentApp = Storage.get('applicationType')
        let launchLocation = Storage.get(currentApp+"LaunchLocation")
        console.log("current app is ", currentApp)
        let params = {
          launchLocation: launchLocation,
          appIdentifier: self.appIdentifiers[currentApp]
        }
        if(currentApp.startsWith("YouTube")){
          params["url"] = Storage.get(currentApp+"DefaultURL");
          appApi.getPluginStatus(currentApp).then(result => {
            if(result[0].state === (Settings.get("platform", "enableAppSuspended")? "suspended":"deactivated")) {
              appApi.launchApp(currentApp, params).catch(err => {
                console.error(`Error in launching ${currentApp} : ` + JSON.stringify(err))
              });
            } else {
              console.log("App HdmiCec_2 onActiveSourceStatusUpdated skipping; "+currentApp+" is already:", JSON.stringify(result[0].state));
            }
          })
        }
      }
      else{
        let currentApp = Storage.get('applicationType')
        if(currentApp.startsWith("YouTube")){
          appApi.getPluginStatus(currentApp).then(result => {
            if(result[0].state !== (Settings.get("platform", "enableAppSuspended")? "suspended":"deactivated")) {
              appApi.exitApp(currentApp, true)
            } else {
              console.log("App HdmiCec_2 onActiveSourceStatusUpdated skipping; "+currentApp+" is already:", JSON.stringify(result[0].state));
            }
          })
        }
      }
      Storage.set("UICacheCECActiveSourceStatus", notification.status);
      console.log("App HdmiCec_2 onActiveSourceStatusUpdated UICacheCECActiveSourceStatus:", Storage.get("UICacheCECActiveSourceStatus"));
    } else {
      console.warn("App HdmiCec_2 onActiveSourceStatusUpdated discarding.");
    }
  })
  }

  _firstEnable() {
    thunder.on("org.rdk.System", "onSystemPowerStateChanged", notification => {
        console.log(new Date().toISOString() + " onSystemPowerStateChanged Notification: ",notification);
        if(notification.powerState !== "ON" && notification.currentPowerState === "ON"){
          console.log("onSystemPowerStateChanged Notification: power state was changed from ON to " + notification.powerState)

          //TURNING OFF THE DEVICE
          Storage.set('SLEEPING', notification.powerState)

          let currentApp = Storage.get('applicationType')
          if (currentApp !== "") {
            appApi.exitApp(currentApp); //will suspend/destroy the app depending on the setting.
          }
          Router.navigate('menu');
        }

        else if(notification.powerState === "ON" && notification.currentPowerState !== "ON"){
          //TURNING ON THE DEVICE
          Storage.remove('SLEEPING')
        }
    })

    console.log("App Calling listenToVoiceControl method to activate VoiceControl Plugin")
    this.listenToVoiceControl();
  }

  listenToVoiceControl() {
    let self = this;
    console.log("App listenToVoiceControl method got called, Activating and listening to VoiceControl Plugin")

    thunder.Controller.activate({callsign: 'org.rdk.VoiceControl'}).then(res => {
      console.log("App VoiceControl Plugin Activation result: ",res)
      /* Alexa App State Report: HOME */
      ApplicationStateReporter.event.payload.value.id = "amzn1.alexa-ask-target.shortcut.33122";
      ApplicationStateReporter.event.payload.value.timeOfSample = new Date().toISOString();
      ApplicationStateReporter.context.properties[0].timeOfSample = new Date().toISOString();
      console.log("Sending appstatereport to Alexa:", ApplicationStateReporter);
      thunder.call('org.rdk.VoiceControl', 'sendVoiceMessage', ApplicationStateReporter).catch(err => {
        console.error("VoiceControl sendVoiceMessage error:", err);
        resolve(false)
      })
      appApi.getVolumeLevel(((Storage.get("deviceType")=="tv")?"SPEAKER0":"HDMI0")).then(volres => {
        VolumePayload.msgPayload.event.payload.volume = volres.volumeLevel
      })
      appApi.muteStatus(((Storage.get("deviceType")=="tv")?"SPEAKER0":"HDMI0")).then(muteRes => {
        VolumePayload.msgPayload.event.payload.muted = muteRes.muted
      })
      console.log("App reporting device volume to Alexa:", VolumePayload)
      thunder.call('org.rdk.VoiceControl', 'sendVoiceMessage',VolumePayload).then(result =>{console.log("deviceVoiceReport", result)}).catch(err => {
        resolve(false)
      })
      if(appApi.checkAlexaAuthStatus() === "AlexaHandleError") {
        // Work Around: Actiavte SmartScreen asssuming Auth completed.
        let updatedLanguage=availableLanguageCodes[localStorage.getItem('Language')]
        let updatedTimeZone = appApi.getZone()
        appApi.getAlexaDeviceSettings().then((response) => { })
        thunder.on('org.rdk.VoiceControl', 'onServerMessage', notification => {
        if(notification.xr_speech_avs.deviceSettings.currentLocale.toString() != updatedLanguage){
            for(let i=0;i<notification.xr_speech_avs.deviceSettings.supportedLocales.length;i++){      
              if(updatedLanguage===notification.xr_speech_avs.deviceSettings.supportedLocales[i].toString()){ 
                  appApi.setLanguageinAlexa(updatedLanguage)
             }
           }
          }            
        })         
        appApi.setTimeZoneinAlexa(updatedTimeZone)
        console.log("App checkAlexaAuthStatus is AlexaHandleError; activating SmartScreen.");
        appApi.getPluginStatus("SmartScreen").then(res => {
          console.log("App getPluginStatus result: " + JSON.stringify(res));
          if (res[0].state === "deactivated") {
            thunder.Controller.activate({callsign: 'SmartScreen'}).then(res => {
              console.log("App Activate SmartScreen result: " + res);
            }).catch(err => {
              console.error("App Activate SmartScreen ERROR!: ",err)
            })
          }
        }).catch(err => {
          console.error("App getPluginStatus SmartScreen ERROR: ",err);
        })
      }

      console.log("App VoiceControl check if user has denied ALEXA:", appApi.checkAlexaAuthStatus())

      thunder.on('org.rdk.VoiceControl', 'onServerMessage', notification => {
        console.log("VoiceControl.onServerMessage Notification: ", notification)

        if(appApi.checkAlexaAuthStatus() !== "AlexaUserDenied") {
          if(notification.xr_speech_avs.state_reporter === "authorization_req" || notification.xr_speech_avs.code){
            // DAB Demo Work Around - disabling.
            //Storage.set("code", notification.xr_speech_avs.code)
            //Storage.set("url", notification.xr_speech_avs.url)
            //if(Router.getActiveHash() != "AlexaScreen" && Router.getActiveHash() != "CodeScreen1"){
            //  Router.navigate("AlexaScreen")
            //}
            console.log("Alexa Auth URL is ", notification.xr_speech_avs.url)
            if (!Router.isNavigating() && appApi.isConnectedToInternet() && (Router.getActiveHash() === "menu")) {
              console.log("App Activating SmartScreen instance for Alexa Authentication.");
              appApi.getPluginStatus("SmartScreen").then(res => {
                console.log("App getPluginStatus result: " + JSON.stringify(res));
                if (res[0].state === "deactivated") {
                  thunder.Controller.activate({callsign: 'SmartScreen'}).then(res => {
                    console.log("App Activate SmartScreen result: " + res);
                  }).catch(err => {
                    console.error("App Activate SmartScreen ERROR!: ",err)
                  })
                }
              }).catch(err => {
                console.error("App getPluginStatus SmartScreen ERROR: ",err);
              })
            }
            if(Router.getActiveHash() === "menu"){
              if(Router.getActiveHash() != "AlexaLoginScreen" && Router.getActiveHash() != "CodeScreen"){
                console.log("Routing to Alexa login page")
                Router.navigate("AlexaLoginScreen")
              }
            }
            console.log("Alexa Auth OTP is ", notification.xr_speech_avs.code)
          } else if (notification.xr_speech_avs.state_reporter === "authendication") {
            console.log("Alexa Auth State is now at ", notification.xr_speech_avs.state)
            if (notification.xr_speech_avs.state === "refreshed") {
              // DAB Demo Work Around - show Alexa Error screens only after Auth is succeeded.
              appApi.setAlexaAuthStatus("AlexaHandleError")
              Router.navigate("SuccessScreen")
            } else if ((notification.xr_speech_avs.state === "uninitialized") || (notification.xr_speech_avs.state === "authorizing")) {
              appApi.setAlexaAuthStatus("AlexaAuthPending")
            } else if (notification.xr_speech_avs.state === "unrecoverable error") {
              // Could be AUTH token Timeout; refresh it.
              Router.navigate("FailureScreen")
            }
          } else if (notification.xr_speech_avs.state_reporter === "login" && notification.xr_speech_avs.state === "User request to disable Alexa") {
            // https://jira.rdkcentral.com/jira/browse/RDKDEV-746: SDK abstraction layer sends on SKIP button event.
            appApi.setAlexaAuthStatus("AlexaUserDenied")
          }
        }

        if((appApi.checkAlexaAuthStatus() === "AlexaHandleError") && (notification.xr_speech_avs.state === "CONNECTING" ||
            notification.xr_speech_avs.state === "DISCONNECTED")) {// || notification.xr_speech_avs.state === "CONNECTED"
          this.tag("Failscreen1").alpha = 1
          this.tag("Widgets").visible = false;
          this.tag("Pages").visible = false;
          this.tag("Failscreen1").notify({ title: 'Alexa State', msg: notification.xr_speech_avs.state })
          setTimeout(()=> {
            this.tag("Failscreen1").alpha = 0
            this.tag("Widgets").visible = true;
            this.tag("Pages").visible = true;
          }, 5000);
        }
        if((appApi.checkAlexaAuthStatus() != "AlexaUserDenied") && notification.xr_speech_avs.state){
          if (notification.xr_speech_avs.state.guiAPL === "ACTIVATED") {
            appApi.zorder("SmartScreen");
            appApi.setOpacity("SmartScreen", 100);
            appApi.visible("SmartScreen", true);
            appApi.setFocus(Storage.get("applicationType") === "" ? "ResidentApp" : Storage.get("applicationType"));
          }
          if(notification.xr_speech_avs.state.dialogUX  === "idle" && notification.xr_speech_avs.state.audio === "stopped"){
            console.log("App current AlexaAudioplayerActive state:" + AlexaAudioplayerActive);
            if (AlexaAudioplayerActive && notification.xr_speech_avs.state.guiManager === "DEACTIVATED" || !AlexaAudioplayerActive) {
              AlexaAudioplayerActive = false;
              appApi.setFocus(Storage.get("applicationType") === "" ? "ResidentApp" : Storage.get("applicationType"));
            }
          }
          if(notification.xr_speech_avs.state.dialogUX=== "idle" && notification.xr_speech_avs.state.audio  === "playing"){
            appApi.zorder("SmartScreen")
            appApi.setOpacity("SmartScreen", 100)
            appApi.visible("SmartScreen", true)
            appApi.setFocus("SmartScreen")
          }
          if(notification.xr_speech_avs.state.dialogUX=== "listening"){
            appApi.zorder("SmartScreen")
              appApi.setOpacity("SmartScreen", 100)
            appApi.visible("SmartScreen", true)
          }
          if(notification.xr_speech_avs.state.dialogUX === "speaking"){
            appApi.zorder("SmartScreen")
            appApi.setOpacity("SmartScreen", 100)
            appApi.visible("SmartScreen", true)
            appApi.setFocus("SmartScreen")
          }
          if (notification.xr_speech_avs.state_reporter === "dialog") {
            // Smartscreen playback state reports
            if ((notification.xr_speech_avs.state.dialogUX === "idle") && (notification.xr_speech_avs.state.audio)) {
              appApi.setAlexaSmartscreenAudioPlaybackState(notification.xr_speech_avs.state.audio);
            }
          }
        }
        if(notification.xr_speech_avs.directive && (appApi.checkAlexaAuthStatus() != "AlexaUserDenied")){
          const header = notification.xr_speech_avs.directive.header
          const payload = notification.xr_speech_avs.directive.payload
           /////////Alexa.Launcher START
          if(header.namespace === "Alexa.Launcher"){
            //Alexa.launcher will handle launching a particular app(exiting might also be there)
            if(header.name === "LaunchTarget"){
              //Alexa payload will be to "launch" an app
              if(AlexaLauncherKeyMap[payload.identifier]){
                let appCallsign = AlexaLauncherKeyMap[payload.identifier].callsign
                let appUrl = AlexaLauncherKeyMap[payload.identifier].url //keymap url will be default, if alexa can give a url, it can be used istead
                let targetRoute = AlexaLauncherKeyMap[payload.identifier].route
                let params = {
                  url: appUrl,
                  launchLocation: "alexa",
                  appIdentifier:self.appIdentifiers[appCallsign]
                }
                // Send AVS State report: STOP request if "playing" to end the Smartscreen App instance.
                if (appApi.checkAlexaSmartscreenAudioPlaybackState() == "playing"){
                  PlaybackStateReport.msgPayload.event.endpoint.endpointId = notification.xr_speech_avs.directive.endpoint.endpointId
                  PlaybackStateReport.msgPayload.event.payload.change.properties[0].value.state = "Pause";
                  console.log("Sending playbackstatereport to Pause:", PlaybackStateReport)
                  thunder.call('org.rdk.VoiceControl', 'sendVoiceMessage',PlaybackStateReport).catch(err => {
                    console.error("VoiceControl sendVoiceMessage error:", err);
                    resolve(false)
                  })
                }
                console.log("Alexa is trying to launch "+ appCallsign + " using params: "+ JSON.stringify(params))
                if(appCallsign){ //appCallsign is valid means target is an app and it needs to be launched
                  appApi.launchApp(appCallsign,params).catch(err => {
                    console.log("Alexa.Launcher LaunchTarget checkerrstatusAlexa", err)
                    if(err.includes("Netflix")){
                      errorPayload.msgPayload.event.payload.type = "INVALID_VALUE"
                      errorPayload.msgPayload.event.payload.message ="AppId is not supported in RDK,"
                    }
                    else{
                      errorPayload.msgPayload.event.payload.type = "ENDPOINT_UNREACHABLE"
                      errorPayload.msgPayload.event.payload.message ="ENDPOINT_UNREACHABLE"
                    }
                    errorPayload.msgPayload.event.header.correlationToken = notification.xr_speech_avs.directive.header.correlationToken
                    errorPayload.msgPayload.event.header.payloadVersion = notification.xr_speech_avs.directive.header.payloadVersion
                    errorPayload.msgPayload.event.endpoint.endpointId = notification.xr_speech_avs.directive.endpoint.endpointId
                    errorPayload.msgPayload.event.header.messageId = notification.xr_speech_avs.directive.header.messageId
                    console.log("Alexa.Launcher LaunchTarget errorpayload",errorPayload)
                    console.error("Alexa.Launcher LaunchTarget Error in launching "+ appCallsign + " via Alexa: " + JSON.stringify(err))
                    thunder.call('org.rdk.VoiceControl', 'sendVoiceMessage',errorPayload).then(result =>{console.log("alexaError", result)}).catch(err => {
                      resolve(false)
                    })
                  });
                } else if(targetRoute){
                  console.log("Alexa.Launcher is trying to route to ", JSON.stringify(targetRoute))
                  // exits the app if any and navigates to the specific route.
                  this.jumpToRoute(targetRoute);
                  for (let [key, value] of Object.entries(AlexaLauncherKeyMap)) {
                    if (value.hasOwnProperty("route") && (value.route === targetRoute)) {
                      ApplicationStateReporter.event.payload.value.id = key;
                      ApplicationStateReporter.event.payload.value.timeOfSample = new Date().toISOString();
                      ApplicationStateReporter.context.properties[0].timeOfSample = new Date().toISOString();
                      console.log("Sending appstatereport to Alexa:", ApplicationStateReporter);
                      thunder.call('org.rdk.VoiceControl', 'sendVoiceMessage', ApplicationStateReporter).catch(err => {
                        console.error("VoiceControl sendVoiceMessage error:", err);
                        resolve(false)
                      })
                      break;
                    }
                  }
                }
              } else {
                console.log("Alexa.Launcher is trying to launch an unsupported app : "+JSON.stringify(payload))
              }
            }
          }/////////Alexa.Launcher END
          else if(header.namespace === "Alexa.RemoteVideoPlayer") { //alexa remote video player will search on youtube for now
            console.log("Alexa.RemoteVideoPlayer: "+JSON.stringify(header))
            if(header.name === "SearchAndDisplayResults" || header.name === "SearchAndPlay"){
              console.log("Alexa.RemoteVideoPlayer: SearchAndDisplayResults || SearchAndPlay: "+JSON.stringify(header))
              /* Find if payload contains Destination App */
              if (payload.hasOwnProperty("entities")) {
                let entityId = payload.entities.filter(obj => Object.keys(obj).some(key => obj[key].hasOwnProperty("ENTITY_ID")));
                if (entityId.length && AlexaLauncherKeyMap[entityId[0].externalIds.ENTITY_ID]) {
                  /* ENTITY_ID or vsk key found; meaning Target App is there in response. */
                  let replacedText = payload.searchText.transcribed.replace(entityId[0].value.toLowerCase(),"").trim();
                  let appCallsign = AlexaLauncherKeyMap[entityId[0].externalIds.ENTITY_ID].callsign
                  //let appUrl = AlexaLauncherKeyMap[entityId[0].externalIds.ENTITY_ID].url
                  let launchParams = {
                    url: "",
                    launchLocation: "alexa",
                    appIdentifier:self.appIdentifiers[appCallsign]
                  }
                  if ("Netflix" === appCallsign) {
                    launchParams.url = encodeURI(replacedText);
                  } else if (appCallsign.startsWith("YouTube")) {
                    launchParams.url = Storage.get(appCallsign+"DefaultURL")+"&va="+((header.name === "SearchAndPlay")?"play":"search")+"&vq=" + encodeURI(replacedText);
                  }
                  console.log("Alexa.RemoteVideoPlayer: launchApp " + appCallsign + " with params " + launchParams)
                  appApi.launchApp(appCallsign, launchParams).then(res => {
                    console.log("Alexa.RemoteVideoPlayer:" + appCallsign + " launched successfully using alexa search: " + JSON.stringify(res))
                  }).catch(err => {
                    console.log("Alexa.RemoteVideoPlayer:" + appCallsign + " launch FAILED using alexa search: " + JSON.stringify(err))
                  })
                  replacedText = null;
                  appCallsign = null;
                  launchParams = null;
                } else if (!entityId.length && (Storage.get("applicationType") != "")) {
                  /* TODO: Current focused app is not ResidentApp; redirect generic search to it if supported. */
                  console.warn("Alexa.RemoteVideoPlayer: " + Storage.get("applicationType") + " is the focued app; need Voice search integration support to it.");
                } else if (!entityId.length && (Storage.get("applicationType") == "")) {
                  /* Generic global search without a target app; redirect to Youtube as of now. */
                  let replacedText = payload.searchText.transcribed.trim();
                  let appCallsign = AlexaLauncherKeyMap["amzn1.alexa-ask-target.app.70045"].callsign
                  let launchParams = {
                    url: "",
                    launchLocation: "alexa",
                    appIdentifier:self.appIdentifiers[appCallsign]
                  }
                  launchParams.url = Storage.get(appCallsign+"DefaultURL")+"&va="+((header.name === "SearchAndPlay")?"play":"search")+"&vq=" + encodeURI(replacedText);
                  console.log("Alexa.RemoteVideoPlayer: global search launchApp " + appCallsign + " with params " + launchParams)
                  appApi.launchApp(appCallsign, launchParams).then(res => {
                    console.log("Alexa.RemoteVideoPlayer:" + appCallsign + " launched successfully using alexa search: " + JSON.stringify(res))
                  }).catch(err => {
                    console.log("Alexa.RemoteVideoPlayer:" + appCallsign + " launch FAILED using alexa search: " + JSON.stringify(err))
                  })
                  replacedText = null;
                  appCallsign = null;
                  launchParams = null;
                } else {
                  /* Possibly an unsupported App. */
                  console.warn("Alexa.RemoteVideoPlayer: got ENTITY_ID " + entityId[0].externalIds.ENTITY_ID + "but no match in AlexaLauncherKeyMap.");
                }
              } else {
                console.warn("Alexa.RemoteVideoPlayer: payload does not have entities; may not work.");
              }
            }
          }
          else if(header.namespace === "Alexa.PlaybackController"){
            console.log("chek",notification.xr_speech_avs.directive.header)
            PlaybackStateReport.msgPayload.event.endpoint.endpointId = notification.xr_speech_avs.directive.endpoint.endpointId
            PlaybackStateReport.msgPayload.event.payload.change.properties[0].value.state  = notification.xr_speech_avs.directive.header.name;
            console.log("playbackstatereport",PlaybackStateReport)
            thunder.call('org.rdk.VoiceControl', 'sendVoiceMessage',PlaybackStateReport).then(result =>{console.log("alexaPlayback", result)}).catch(err => {
            resolve(false)
            })
            let currentApp=Storage.get("applicationType")
            let playbackOperations=new Set(["Play","Pause","FastForward","Rewind","Shuffle","Repeat"])
            if(currentApp.startsWith("YouTube"))
            {
                if(playbackOperations.has(notification.xr_speech_avs.directive.header.name))
                {
                  let url = Storage.get(currentApp+"DefaultURL")+"&va=media"+notification.xr_speech_avs.directive.header.name+"&vs=2&inApp=true";
                  console.log("Operation performed with deeplink URL: " + url)
                  thunder.call(currentApp, 'deeplink', url)
                }
                else if(notification.xr_speech_avs.directive.header.name === "Next" || notification.xr_speech_avs.directive.header.name === "Previous")
                {
                  let url = Storage.get(currentApp+"DefaultURL")+"&va=media"+notification.xr_speech_avs.directive.header.name+"Video&vs=2&inApp=true";
                  console.log("Operation performed with deeplink URL: " + url)
                  thunder.call(currentApp, 'deeplink', url)
                }
            }
          }
          else if(header.namespace === "Alexa.SeekController")
          {
              console.log("Seek controller",notification.xr_speech_avs.directive)
              let currentApp=Storage.get("applicationType")
              if(currentApp.startsWith("YouTube"))
              {
                  let time=notification.xr_speech_avs.directive.payload.deltaPositionMilliseconds/1000
                  let minutes=Math.abs(parseInt(time/60))
                  let seconds=Math.abs(parseInt(time%60))
                  if(time<0)
                  {
                    let url=Storage.get(currentApp+"DefaultURL")+"&va=mediaRewind&vaa="+minutes+"m"+seconds+"s"+"&vs=2&inApp=true";
                    console.log("Operation performed with deeplink URL: " + url)
                    thunder.call(currentApp, 'deeplink', url)
                  }
                  else
                  {
                    let url=Storage.get(currentApp+"DefaultURL")+"&va=mediaFastForward&vaa="+minutes+"m"+seconds+"s"+"&vs=2&inApp=true";
                    console.log("Operation performed with deeplink URL: " + url)
                    thunder.call(currentApp, 'deeplink', url)
                  }
              }
          }
          else if(header.namespace === "AudioPlayer"){
            if (header.name === "Play") {
              appApi.visible("SmartScreen", true);
              appApi.setOpacity("SmartScreen", 100);
              appApi.zorder("SmartScreen");
              appApi.setFocus("SmartScreen");
              AlexaAudioplayerActive = true;
              console.log("App AudioPlayer: Suspending the current app:'" + Storage.get("applicationType") + "'");
              if (Storage.get("applicationType") != "") {
                appApi.exitApp(Storage.get("applicationType"));
              }
            }
          }
          else if (header.namespace === "TemplateRuntime") {
            if (header.name === "RenderPlayerInfo") {
              appApi.visible("SmartScreen", true);
              appApi.setOpacity("SmartScreen", 100);
              appApi.zorder("SmartScreen");
              appApi.setFocus("SmartScreen");
              AlexaAudioplayerActive = true;
            }
          }
          else if(header.namespace === "Speaker"){
            console.log("Speaker")
            if(header.name === "AdjustVolume"){
              VolumePayload.msgPayload.event.header.messageId = header.messageId
              appApi.getVolumeLevel(((Storage.get("deviceType")=="tv")?"SPEAKER0":"HDMI0")).then(volres =>{
                console.log("volres",volres, parseInt(volres.volumeLevel))
              if((parseInt(volres.volumeLevel) >= 0) || (parseInt(volres.volumeLevel) <= 100)) {
                VolumePayload.msgPayload.event.payload.volume = parseInt(volres.volumeLevel) + payload.volume
                console.log("volumepayload", VolumePayload.msgPayload.event.payload.volume)
                if(VolumePayload.msgPayload.event.payload.volume < 0){
                  VolumePayload.msgPayload.event.payload.volume = 0
                }
                if(VolumePayload.msgPayload.event.payload.volume > 100){
                  VolumePayload.msgPayload.event.payload.volume = 100
                }
              }
              VolumePayload.msgPayload.event.payload.muted = false
              console.log("cehckvolume", VolumePayload.msgPayload.event.payload.volume)
              console.log("adjust volume", VolumePayload)
              appApi.setVolumeLevel(((Storage.get("deviceType")=="tv")?"SPEAKER0":"HDMI0"), VolumePayload.msgPayload.event.payload.volume).then(res =>{})
              })

            }
            if(header.name === "SetVolume"){
            // VolumePayload.msgPayload.event.header.name=  header.name
              VolumePayload.msgPayload.event.header.messageId = header.messageId
              VolumePayload.msgPayload.event.payload.volume = payload.volume
              VolumePayload.msgPayload.event.payload.muted = false
              console.log("adjust volume", VolumePayload)
              console.log("checkvolume", VolumePayload.msgPayload.event.payload.volume)
              appApi.setVolumeLevel(((Storage.get("deviceType")=="tv")?"SPEAKER0":"HDMI0"), VolumePayload.msgPayload.event.payload.volume).then(res =>{
                this.tag("Volume").onVolumeChanged()
              })
            }
            if(header.name === "SetMute"){
              VolumePayload.msgPayload.event.header.messageId = header.messageId
              VolumePayload.msgPayload.event.payload.volume = payload.volume
              VolumePayload.msgPayload.event.payload.muted = payload.mute
              appApi.audio_mute(((Storage.get("deviceType")=="tv")?"SPEAKER0":"HDMI0"),VolumePayload.msgPayload.event.payload.muted).then(res =>{})
            }
          }
        }
      })

      thunder.on('org.rdk.VoiceControl', 'onKeywordVerification', notification => {
        console.log("VoiceControl.onKeywordVerification Notification: " + JSON.stringify(notification))
      })

      thunder.on('org.rdk.VoiceControl', 'onSessionBegin', notification => {
        this.$hideImage(0);
        console.log("VoiceControl.onSessionBegin Notification: " + JSON.stringify(notification))
      })

      thunder.on('org.rdk.VoiceControl', 'onSessionEnd', notification => {
        console.log("VoiceControl.onSessionEnd Notification: " + JSON.stringify(notification))
        if (notification.result === "success" && notification.success.transcription === "User request to disable Alexa") {
          console.warn("App VoiceControl.onSessionEnd got disable Alexa.")
          appApi.resetAVSCredentials() // To avoid Audio Feedback
          appApi.setAlexaAuthStatus("AlexaUserDenied") // Reset back to disabled as resetAVSCredentials() sets to ErrorHandling.
        }
      })

      thunder.on('org.rdk.VoiceControl', 'onStreamBegin', notification => {
        console.log("VoiceControl.onStreamBegin Notification: " + JSON.stringify(notification))
      })

      thunder.on('org.rdk.VoiceControl', 'onStreamEnd', notification => {
        console.log("VoiceControl.onStreamEnd Notification: " + JSON.stringify(notification))
      })

      thunder.on('org.rdk.VoiceControl', 'onSuspend', notification => {
        console.log("VoiceControl.onSuspend Notification: " + JSON.stringify(notification))
      })
    }).catch(err => {
      console.log("VoiceControl Plugin Activation ERROR!: ",err)
    })
  }

  activateChildApp(plugin) { //#currentlyNotUsed #needToBeRemoved
    fetch('http://127.0.0.1:9998/Service/Controller/')
      .then(res => res.json())
      .then(data => {
        data.plugins.forEach(element => {
          if (element.callsign === plugin) {
            Storage.set('applicationType', plugin);
            appApi.launchPremiumApp(plugin).catch(() => { });
            appApi.setVisibility('ResidentApp', false);
          }
        });
        console.log('launching app')
      })
      .catch(err => {
        console.log(`${plugin} not available`, err)
      })
  }

  deactivateChildApp(plugin) { //#needToBeRemoved
    switch (plugin) {
      case 'WebApp':
        appApi.deactivateWeb();
        break;
      case 'YouTube':
        appApi.suspendPremiumApp("YouTube").then(res => {
          console.log(`YouTube : suspend YouTube request`);
        }).catch((err) => {
          console.error(err)
        });
        break;
      case 'YouTubeTV':
        appApi.suspendPremiumApp("YouTubeTV").then(res => {
          console.log(`YouTubeTV : suspend YouTubeTV request`);
        }).catch((err) => {
          console.error(err)
        });
        break;
      case 'YouTubeKids':
        appApi.suspendPremiumApp("YouTubeKids").then(res => {
          console.log(`YouTubeKids : suspend YouTubeKids request`);
        }).catch((err) => {
          console.error(err)
        });
        break;
      case 'Lightning':
        appApi.deactivateLightning();
        break;
      case 'Native':
        appApi.killNative();
        break;
      case 'Amazon':
        appApi.suspendPremiumApp('Amazon').then(res => {
          if (res) {
            let params = { applicationName: "AmazonInstantVideo", state: 'suspended' };
            this.xcastApi.onApplicationStateChanged(params);
          }
        });
        break;
        case "Netflix":
          appApi.suspendPremiumApp("Netflix").then((res) => {
            Router.navigate(Storage.get("lastVisitedRoute"));
            thunder.call("org.rdk.RDKShell", "setFocus", {
              client: "ResidentApp",
            });
            thunder.call("org.rdk.RDKShell", "setVisibility", {
              client: "ResidentApp",
              visible: true,
            });
            thunder.call("org.rdk.RDKShell", "moveToFront", {
              client: "ResidentApp",
              callsign: "ResidentApp",
            });
            if (res) {
              let params = { applicationName: "NetflixApp", state: "suspended" };
              this.xcastApi.onApplicationStateChanged(params);
            }
          });
          break;
      case 'HDMI':
        new HDMIApi().stopHDMIInput()
        Storage.set("_currentInputMode", {});
        break;
      default:
        break;
    }
  }

  $initLaunchPad(url) {

    return new Promise((resolve, reject) => {
      appApi.getPluginStatus('Netflix')
        .then(result => {
          console.log(`netflix plugin status is :`, JSON.stringify(result));
          console.log(`netflix plugin status is :`, result);

          if (result[0].state === 'deactivated' || result[0].state === 'deactivation') {

            Router.navigate('image', { src: Utils.asset('images/apps/App_Netflix_Splash.png') })
            if (url) {
              appApi.configureApplication('Netflix', url).then(() => {
                appApi.launchPremiumApp("Netflix").then(res => {
                  appApi.setVisibility('ResidentApp', false);
                  resolve(true)
                }).catch(err => { reject(false) });// ie. org.rdk.RDKShell.launch
              }).catch(err => {
                console.error("Netflix : error while fetching configuration data : ", JSON.stringify(err))
                reject(err)

              })// gets configuration object and sets configuration
            }
            else {
              appApi.launchPremiumApp("Netflix").then(res => {
                appApi.setVisibility('ResidentApp', false);
                resolve(true)
              }).catch(err => { reject(false) });// ie. org.rdk.RDKShell.launch
            }

          }
          else {
            /* Not in deactivated; could be suspended */
            if (url) {
              appApi.launchPremiumApp("Netflix").then(res => {
                thunder.call("Netflix", "systemcommand",
                  { "command": url })
                  .then(res => {

                  }).catch(err => {
                    console.error("Netflix : error while sending systemcommand : ", JSON.stringify(err))
                    reject(false);
                  });
                appApi.setVisibility('ResidentApp', false);
                resolve(true)
              }).catch(err => { reject(false) });// ie. org.rdk.RDKShell.launch
            }
            else {
              appApi.launchPremiumApp("Netflix").then(res => {
                console.log(`Netflix : launch premium app resulted in `, JSON.stringify(res));
                appApi.setVisibility('ResidentApp', false);
                resolve(true)
              });
            }

          }
        })
        .catch(err => {
          console.log('Netflix plugin error', err)
          Storage.set('applicationType', '')
          reject(false)
        })
    })
  }

  /**
   * Function to register event listeners for Xcast plugin.
   */
   registerXcastListeners() {
    let self = this;
    this.xcastApi.registerEvent('onApplicationLaunchRequest', notification => {
      console.log('App onApplicationLaunchRequest: ' + JSON.stringify(notification));

      if (this.xcastApps(notification.applicationName)) {
        let applicationName = this.xcastApps(notification.applicationName);

        if (applicationName.startsWith("YouTube")) {
          let params = {
            url: notification.parameters.url,
            launchLocation: "dial",
            appIdentifier:self.appIdentifiers[applicationName]
          }
          appApi.launchApp(applicationName, params).then(res => {
            console.log("App onApplicationLaunchRequest: launched "+applicationName+" : ", res);
            Storage.set("applicationType", applicationName)
            // TODO: move to Controller.statuschange event
            let params = { applicationName: notification.applicationName, state: 'running' };
            this.xcastApi.onApplicationStateChanged(params);
          }).catch(err => {
            console.log("App onApplicationLaunchRequest: error ", err)
          })
        }
      }
    });

    this.xcastApi.registerEvent('onApplicationHideRequest', notification => {
      console.log('App onApplicationHideRequest: ' + JSON.stringify(notification));

      if (this.xcastApps(notification.applicationName)) {
        let applicationName = this.xcastApps(notification.applicationName);
        console.log('App onApplicationHideRequest: ' + this.xcastApps(notification.applicationName));
        if (applicationName.startsWith("YouTube")) {
          //second argument true means resident app won't be launched the required app will be exited in the background.
          //only bring up the resident app when the notification is from the current app(ie app in focus)
          console.log("App onApplicationHideRequest: exitApp as " + applicationName + "!==" + Storage.get("applicationType"));
          appApi.exitApp(applicationName, applicationName !== Storage.get("applicationType"));
        }
      }
    });

    this.xcastApi.registerEvent('onApplicationResumeRequest', notification => {
      console.log('App onApplicationResumeRequest: ' + JSON.stringify(notification));
      if (this.xcastApps(notification.applicationName)) {
        let applicationName = this.xcastApps(notification.applicationName);
        let params = {
          url: notification.parameters.url,
          launchLocation: "dial",
          appIdentifier:self.appIdentifiers[applicationName]
        }

        console.log('App onApplicationResumeRequest: launchApp ', applicationName, " with params: ", params);
        appApi.launchApp(applicationName, params).then(res => {
          Storage.set("applicationType", applicationName)
          console.log("App onApplicationResumeRequest: launched ", applicationName, " result: ", res);
        }).catch(err => {
          console.log("Error in launching ", applicationName, " on casting resume request: ", err);
        })
      }
    });

    this.xcastApi.registerEvent('onApplicationStopRequest', notification => {
      console.log('App onApplicationStopRequest: ' + JSON.stringify(notification));
      if (this.xcastApps(notification.applicationName)) {
        let applicationName = this.xcastApps(notification.applicationName);
        if (applicationName.startsWith("YouTube")) {
          appApi.deactivateCobalt(applicationName)
          if (Storage.get("applicationType") === applicationName) {
            appApi.exitApp(applicationName);
          }
        }
      }
    });

    this.xcastApi.registerEvent('onApplicationStateRequest', notification => {
      console.log("App onApplicationStateRequest: " + JSON.stringify(notification));
      if (this.xcastApps(notification.applicationName)) {
        let applicationName = this.xcastApps(notification.applicationName);
        let appState = { "applicationName": notification.applicationName, "state": "stopped" };
        appApi.checkStatus(applicationName).then(result => {
          switch(result[0].state) {
            case "activated":
            case "resumed":
              appState.state = "running";
              break;
            case "Activation":
            case "deactivated":
            case "Deactivation":
            case "Precondition":
              appState.state = "stopped";
              break;
            case "suspended":
              appState.state = "suspended";
              break;
          }
          this.xcastApi.onApplicationStateChanged(appState);
        }).catch(error => {
          console.error("App onApplicationStateRequest: checkStatus error ", error);
        })
      }
    });
  }

  /**
   * Function to get the plugin name for the application name.
   * @param {string} app App instance.
   */
  xcastApps(app) {
    if (Object.keys(XcastApi.supportedApps()).includes(app)) {
      return XcastApi.supportedApps()[app];
    } else return false;
  }


  $mountEventConstructor(fun) {
    this.ListenerConstructor = fun;
    console.log(`MountEventConstructor was initialized`)
    // console.log(`listener constructor was set t0 = ${this.ListenerConstructor}`);
  }

  $registerUsbMount() {
    this.disposableListener = this.ListenerConstructor();
    console.log(`Successfully registered the usb Mount`)
  }

  $deRegisterUsbMount() {
    console.log(`the current usbListener = ${this.disposableListener}`)
    this.disposableListener.dispose();
    console.log(`successfully deregistered usb listener`);
  }


  standby(value) {
    console.log(`standby call`);
    if (value == 'Back') {
    } else {
      if (powerState == 'ON') {
        console.log(`Power state was on trying to set it to standby`);
        appApi.setPowerState(value).then(res => {

          if (res.success) {
            console.log(`successfully set to standby`);
            powerState = 'STANDBY'
            if (Storage.get('applicationType') !== "") {
              appApi.exitApp(Storage.get('applicationType'));
            } else {
              if (!Router.isNavigating()) {
                Router.navigate('menu')
              }
            }
          }
        })
        return true
      }
    }
  }

  $registerInactivityMonitoringEvents() {
    return new Promise((resolve, reject) => {
      console.log(`registered inactivity listener`);
      appApi.setPowerState('ON').then(res => {
        if (res.success) {
          powerState = 'ON'
        }
      })

      thunder.Controller.activate({
        callsign: 'org.rdk.RDKShell.1'
      })
        .then(res => {
          console.log(`activated the rdk shell plugin trying to set the inactivity listener; res = ${JSON.stringify(res)}`);
          thunder.on("org.rdk.RDKShell.1", "onUserInactivity", notification => {
            console.log(`user was inactive`);
            if (powerState === "ON" && Storage.get('applicationType') == '') {
              this.standby("STANDBY");
            }
          }, err => {
            console.error(`error while inactivity monitoring , ${err}`)
          })
          resolve(res)
        }).catch((err) => {
          reject(err)
          console.error(`error while activating the displaysettings plugin; err = ${err}`)
        })
    })
  }

  $resetSleepTimer(t) {
    console.log(`reset sleep timer call ${t}`);
    var arr = t.split(" ");

    function setTimer() {
      console.log('Timer ', arr)
      var temp = arr[1].substring(0, 1);
      if (temp === 'H') {
        let temp1 = parseFloat(arr[0]) * 60;
        appApi.setInactivityInterval(temp1).then(res => {
          Storage.set('TimeoutInterval', t)
          console.log(`successfully set the timer to ${t} hours`)
        }).catch(err => {
          console.error(`error while setting the timer`)
        });
      } else if (temp === 'M') {
        console.log(`minutes`);
        let temp1 = parseFloat(arr[0]);
        appApi.setInactivityInterval(temp1).then(res => {
          Storage.set('TimeoutInterval', t)
          console.log(`successfully set the timer to ${t} minutes`);
        }).catch(err => {
          console.error(`error while setting the timer`)
        });
      }
    }

    if (arr.length < 2) {
      appApi.enabledisableinactivityReporting(false).then(res => {
        if (res.success === true) {
          Storage.set('TimeoutInterval', false)
          console.log(`Disabled inactivity reporting`);
          // this.timerIsOff = true;
        }
      }).catch(err => {
        console.error(`error : unable to set the reset; error = ${err}`)
      });
    } else {
      appApi.enabledisableinactivityReporting(true).then(res => {
        if (res.success === true) {
          console.log(`Enabled inactivity reporting; trying to set the timer to ${t}`);
          // this.timerIsOff = false;
          setTimer();
        }
      }).catch(err => { console.error(`error while enabling inactivity reporting`) });
    }
  }

  jumpToRoute(route) {
    if (Storage.get('applicationType') != '') {
      appApi.exitApp(Storage.get('applicationType')).catch(err => {
        console.log(err)
      });
      Storage.set("lastVisitedRoute", route);// incase any state change event tries to navigate, it need to be navigated to alexa requested route
      Router.navigate(route);
    } else {
      if (!Router.isNavigating()) {
        if (Router.getActiveHash() === "dtvplayer") { //exit scenario for dtv player
          dtvApi
            .exitChannel()
            .then((res) => {
              console.log("exit channel: ", JSON.stringify(res));
            })
            .catch((err) => {
              console.log("failed to exit channel: ", JSON.stringify(err));
            });
          if (Router.getActiveWidget()) {
            Router.getActiveWidget()._setState("IdleState");
          }
        }
        Storage.set("lastVisitedRoute", route);
        Router.navigate(route);
      }
    }
  }
}
