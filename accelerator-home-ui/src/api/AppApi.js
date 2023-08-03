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
import { Router, Settings, Storage } from '@lightningjs/sdk';
import HDMIApi from './HDMIApi';;
import NetflixIIDs from "../../static/data/NetflixIIDs.json";
import HomeApi from './HomeApi';
import { AlexaLauncherKeyMap, ApplicationStateReporter} from '../Config/AlexaConfig';
import { availableLanguageCodes } from '../Config/Config';

const config = {
  host: '127.0.0.1',
  port: 9998,
  default: 1,
  versions: {
    'org.rdk.System': 2
  }
}
const thunder = ThunderJS(config)
/**
 * Class that contains functions which commuicates with thunder API's
 */
export default class AppApi {
  constructor() {
    this.activatedForeground = false
    this._events = new Map()
  }

  /**
   *
   * @param {string} eventId
   * @param {function} callback
   * Function to register the events for the Bluetooth plugin.
   */
  registerEvent(eventId, callback) {
    this._events.set(eventId, callback)
  }

  fetchTimeZone() {
    return new Promise((resolve) => {
      thunder.call('org.rdk.System', 'getTimeZones')
        .then(result => {
          resolve(result.zoneinfo)
        })
        .catch(err => {
          console.error('AppAPI Cannot fetch time zone', err)
          resolve({})
        })
    })
  }

  isConnectedToInternet() {
    return new Promise((resolve, reject) => {
      let header = new Headers();
      header.append('pragma', 'no-cache');
      header.append('cache-control', 'no-cache');

      fetch("https://apps.rdkcentral.com/rdk-apps/accelerator-home-ui/index.html", { method: 'GET', headers: header, }).then(res => {
        if (res.status >= 200 && res.status <= 300) {
          console.log("AppAPI Connected to internet");
          resolve(true)
        } else {
          console.log("AppAPI No Internet Available");
          resolve(false)
        }
      }).catch(err => {
        console.error("AppAPI Internet Check failed: No Internet Available");
        resolve(false); //fail of fetch method needs to be considered as no internet
      })
    })
  }

  fetchApiKey() {
    return new Promise((resolve) => {
      thunder
        .call('org.rdk.PersistentStore', 'getValue', { namespace: 'gracenote', key: 'apiKey' })
        .then(result => {
          resolve(result.value)
        })
        .catch(err => {
          console.error("AppAPI PersistentStore getValue gracenote apiKey failed.");
          resolve('')
        })
    })
  }

  /**
   * Function to launch Html app.
   * @param {String} url url of app.
   */
  getIP() {
    return new Promise((resolve, reject) => {
      thunder.Controller.activate({ callsign: 'org.rdk.System' })
        .then(() => {
          thunder
            .call('org.rdk.System', 'getDeviceInfo', { params: 'estb_ip' })
            .then(result => {
              resolve(result.success)
            })
            .catch(err => {
              console.error("AppAPI System getDeviceInfo estb_ip failed.");
              resolve(false)
            })
        })
        .catch(err => {
          console.error("AppAPI activate System failed.");
        })
    })
  }
  /**
  *  Function to get timeZone
  */
  getZone() {
    return new Promise((resolve, reject) => {
      thunder.call('org.rdk.System', 'getTimeZoneDST')
        .then(result => {
          resolve(result.timeZone)
        })
        .catch(err => {
          console.error('AppAPI System plugin getTimeZoneDST failed.');
          resolve(undefined)
        })
    })
  }

  setZone(zone) {
    console.log(zone)
    return new Promise((resolve, reject) => {
      thunder
        .call('org.rdk.System', 'setTimeZoneDST', { timeZone: zone })
        .then(result => {
          resolve(result.success)
        }).catch(err => {
          console.error("AppAPI System plugin setTimeZoneDST failed.");
          resolve(false)
        })
    }).catch(err => { })
  }


  getPluginStatus(plugin) {
    return new Promise((resolve, reject) => {
      thunder.call('Controller', `status@${plugin}`)
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          console.error("AppAPI Controller plugin status check failed.");
          reject(err)
        })
    })
  }


  /**
   * Function to get resolution of the display screen.
   */
  getResolution() {
    return new Promise((resolve, reject) => {
      thunder
        .call('org.rdk.DisplaySettings', 'getCurrentResolution', {
          "videoDisplay": "HDMI0"
        })
        .then(result => {
          resolve(result.resolution)
        })
        .catch(err => {
          console.error("AppAPI DisplaySettings plugin getCurrentResolution failed.");
          resolve('NA')
        });
    })

  }

  activateDisplaySettings() {
    return new Promise((resolve, reject) => {
      const systemcCallsign = "org.rdk.DisplaySettings"
      thunder.Controller.activate({ callsign: systemcCallsign })
        .then(res => {
        })
        .catch(err => { console.error(`AppAPI activate DisplaySettings failed.`) })
    });
  }

  getSupportedResolutions() {
    return new Promise((resolve, reject) => {
      thunder.Controller.activate({ callsign: 'org.rdk.DisplaySettings' })
        .then(() => {
          thunder
            .call('org.rdk.DisplaySettings', 'getSupportedResolutions', { params: 'HDMI0' })
            .then(result => {
              resolve(result.supportedResolutions)
            })
            .catch(err => {
              console.error("AppAPI DisplaySettings getSupportedResolutions failed.");
              resolve(false)
            })
        })
        .catch(err => {
          console.error('AppAPI activate DisplaySettings Error', JSON.stringify(err));
        })
    })
  }

  /**
   * Function to set the display resolution.
   */
  setResolution(res) {
    return new Promise((resolve, reject) => {
      thunder.Controller.activate({ callsign: 'org.rdk.DisplaySettings' })
        .then(() => {
          thunder
            .call('org.rdk.DisplaySettings', 'setCurrentResolution', {
              videoDisplay: 'HDMI0',
              resolution: res,
              persist: true,
            })
            .then(result => {
              resolve(result.success)
            })
            .catch(err => {
              console.error("AppAPI DisplaySettings setCurrentResolution failed.");
              resolve(false)
            })
        })
        .catch(err => {
          console.error('AppAPI activate DisplaySettings Error', JSON.stringify(err));
        })
    })
  }

  /**
   * Function to get HDCP Status.
   */
  getHDCPStatus() {
    return new Promise((resolve, reject) => {
      thunder.Controller.activate({ callsign: 'org.rdk.HdcpProfile' })
        .then(() => {
          thunder
            .call('org.rdk.HdcpProfile', 'getHDCPStatus')
            .then(result => {
              console.log("AppAPI HdcpProfile getHDCPStatus : " + JSON.stringify(result.HDCPStatus));
              resolve(result.HDCPStatus)
            })
            .catch(err => {
              console.error("AppAPI HdcpProfile getHDCPStatus failed.");
              resolve(false)
            })
        })
        .catch(err => {
          console.error('AppAPI activate HdcpProfile ', JSON.stringify(err))
        })
    })
  }

  /**
   * Function to get TV HDR Support.
   */
  getTvHDRSupport() {
    return new Promise((resolve, reject) => {
      thunder.Controller.activate({ callsign: 'org.rdk.DisplaySettings' })
        .then(() => {
          thunder
            .call('org.rdk.DisplaySettings', 'getTvHDRSupport')
            .then(result => {
              console.log("AppAPI DisplaySettings getTvHDRSupport : " + JSON.stringify(result));
              resolve(result)
            })
            .catch(err => {
              resolve(false)
            })
        })
        .catch(err => {
          console.error('AppAPI activate DisplaySettings Error', JSON.stringify(err));
        })
    })
  }

  /**
   * Function to get settop box HDR Support.
   */
  getSettopHDRSupport() {
    return new Promise((resolve, reject) => {
      thunder.Controller.activate({ callsign: 'org.rdk.DisplaySettings' })
        .then(() => {
          thunder
            .call('org.rdk.DisplaySettings', 'getSettopHDRSupport')
            .then(result => {
              console.log("AppAPI DisplaySettings getSettopHDRSupport : " + JSON.stringify(result));
              resolve(result)
            })
            .catch(err => {
              console.error('AppAPI DisplaySettings getSettopHDRSupport failed ', JSON.stringify(err));
              resolve(false)
            })
        })
        .catch(err => {
          console.error('AppAPI activate DisplaySettings Error', JSON.stringify(err))
        })
    })
  }

  /**
   * Function to get HDR Format in use.
   */
  getHDRSetting() {
    return new Promise((resolve, reject) => {
      thunder.Controller.activate({ callsign: 'DisplayInfo' })
        .then(() => {
          thunder
            .call('DisplayInfo', 'hdrsetting')
            .then(result => {
              console.log("AppAPI DisplayInfo hdrsetting : " + JSON.stringify(result));
              resolve(result)
            })
            .catch(err => {
              console.error("AppAPI DisplayInfo hdrsetting failed : " + JSON.stringify(err));
              resolve(false)
            })
        })
        .catch(err => {
          console.log('AppAPI activate DisplayInfo Error', JSON.stringify(err))
        })
    })
  }

  /**
   * Function to get DRMs.
   */
  getDRMS() {
    return new Promise((resolve, reject) => {
      thunder.Controller.activate({ callsign: 'OCDM' })
        .then(() => {
          thunder
            .call('OCDM', 'drms')
            .then(result => {
              console.log("AppAPI OCDM supported drms: " + JSON.stringify(result));
              resolve(result)
            })
            .catch(err => {
              console.error("AppAPI OCDM drms failed.");
              resolve(false)
            })
        })
        .catch(err => {
          console.error('AppAPI activate OCDM error:', JSON.stringify(err))
        })
    })
  }

  /**
   * Function to clear cache.
   */
  clearCache() {
    return new Promise((resolve, reject) => {
      thunder
        .call('ResidentApp', 'delete', { path: ".cache" })
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          console.error("AppAPI ResidentApp delete cache failed.");
          resolve(err)
        })
    })
  }

  async getAvailableTypes() {
    return new Promise((resolve, reject) => {
      thunder.call('org.rdk.RDKShell', 'getAvailableTypes', {}).then(result => {
        // Include NativeApp as well as its not being included from backend.
        if (!result.types.includes("NativeApp")) result.types.push("NativeApp");
        console.log("RDKShell.getAvailableTypes:", JSON.stringify(result))
        resolve(result.types)
      }).catch(err => {
        console.error("AppAPI ResidentApp delete cache failed.", err);
        resolve(false)
      })
    })
  }

  /**
   * Function to launch All types of apps. Accepts 2 params.
   * @param {String} callsign String required callsign of the particular app.
   * @param {Object} args Object optional depending on following properties.
   *  @property {string} url: optional for YouTube & netflix | required for Lightning and WebApps
   *  @property {string} launchLocation: optional | to pass Netflix IIDs or YouTube launch reason | launchLocation value is one among these values ["mainView", "dedicatedButton", "appsMenu", "epgScreen", "dial", "gracenote","alexa"]
   *  @property {boolean} preventInternetCheck: optional | true will prevent bydefault check for internet
   *  @property {boolean} preventCurrentExit: optional |  true will prevent bydefault launch of previous app
   */

  async launchApp(callsign, args) {
    const saveAbleRoutes = ["menu","epg","apps"] //routing back will happen to only these routes, otherwise it will default to #menu when exiting the app.
    const lastVisitedRoute = Router.getActiveHash();
    if(saveAbleRoutes.includes(lastVisitedRoute)){
      Storage.set("lastVisitedRoute", lastVisitedRoute);
    } else {
      Storage.set("lastVisitedRoute", "menu");
    }
    Router.navigate("applauncher");
    console.log("AppAPI launchApp called with: ", callsign, args);
    if (callsign.startsWith("YouTube")) {
      Storage.set(callsign+"LaunchLocation", args.launchLocation)
    }

    let url,preventInternetCheck,preventCurrentExit,launchLocation, gracenoteUrl = null;
    if(args){
      url = args.url;
      preventInternetCheck = args.preventInternetCheck;
      preventCurrentExit = args.preventCurrentExit;
      launchLocation = args.launchLocation
    }

    const launchLocationKeyMapping = {
      //currently supported launch locations by the UI and mapping to corresponding reason/keys for IID
      "mainView": { "YouTube": "menu", "YouTubeTV": "menu", "YouTubeKids": "menu", "Netflix": "App_launched_via_Netflix_Icon_On_The_Apps_Row_On_The_Main_Home_Page" },
      "dedicatedButton": { "YouTube": "remote", "YouTubeTV": "remote", "YouTubeKids": "remote", "Netflix": "App_launched_via_Netflix_Button" },
      "appsMenu": { "YouTube": "menu", "YouTubeTV": "menu", "YouTubeKids": "menu", "Netflix": "App_launched_via_Netflix_Icon_On_The_Apps_Section" },
      "epgScreen": { "YouTube": "guide", "YouTubeTV": "guide", "YouTubeKids": "guide", "Netflix": "App_launched_from_EPG_Grid" },
      "dial": { "YouTube": "dial", "YouTubeTV": "dial", "YouTubeKids": "dial", "Netflix": "App_launched_via_DIAL_request" },
      "gracenote": { "YouTube": "launcher", "YouTubeTV": "launcher", "YouTubeKids": "launcher", "Netflix": "App_launched_via_Netflix_Icon_On_The_Apps_Row_On_The_Main_Home_Page" },
      "alexa": { "YouTube": "voice", "YouTubeTV": "voice", "YouTubeKids": "voice", "Netflix": "App_launched_via_Netflix_Icon_On_The_Apps_Row_On_The_Main_Home_Page" },
    };
    if(launchLocation && launchLocationKeyMapping[launchLocation]){
      if(callsign === "Netflix" || callsign.startsWith("YouTube")){
        /* Gracenote provides shortened url which shall only be deeplinked; do not use for activation. */
        if (launchLocation === "gracenote") {
          gracenoteUrl = url
        }
        launchLocation = launchLocationKeyMapping[launchLocation][callsign]
      }
    }

    console.log("AppAPI launchApp with callsign: " + callsign +" | url: " + url +" | preventInternetCheck: " + preventInternetCheck + " | preventCurrentExit: " + preventCurrentExit + " | launchLocation: " + launchLocation);

    let IIDqueryString = "";
    if (callsign === "Netflix") {
      let netflixIids = await this.getNetflixIIDs();
      if (launchLocation) {
        IIDqueryString = `source_type=${netflixIids[launchLocation].source_type}&iid=${netflixIids[launchLocation].iid}`;
        if (url) {
          IIDqueryString = "&" + IIDqueryString; //so that IIDqueryString can be appended with url later.
        }
      } else {
        console.warn("AppAPI launchLocation(IID) not specified while launching netflix");
      }
    }

    const availableCallsigns = await this.getAvailableTypes();

    if (!availableCallsigns.includes(callsign)) {
      Router.navigate(Storage.get("lastVisitedRoute"));
      return Promise.reject("Can't launch App: " + callsign + " | Error: callsign not found!");
    }

    if (!preventInternetCheck) {
      let internet = await this.isConnectedToInternet();
      if (!internet) {
        Router.navigate(Storage.get("lastVisitedRoute"));
        return Promise.reject("No Internet Available, can't launchApp.");
      }
    }

    const currentApp = Storage.get("applicationType"); //get it from stack if required. | current app ==="" means residentApp

    let pluginStatus, pluginState;// to check if the plugin is active, resumed, deactivated etc
    try {
      if (callsign != "NativeApp") {
        pluginStatus = await this.getPluginStatus(callsign);
        pluginState = pluginStatus[0].state;
      }
    } catch (err) {
      console.error(err);
      Router.navigate(Storage.get("lastVisitedRoute"));
      return Promise.reject("AppAPI PluginError: " + callsign + ": App not supported on this device | Error: " + JSON.stringify(err));
    }
    console.log("AppAPI " +callsign+" : pluginStatus: " + JSON.stringify(pluginStatus) + " pluginState: ", JSON.stringify(pluginState));

    if (callsign === "Netflix") {
      if (pluginState === "deactivated" || pluginState === "deactivation") { //netflix cold launch scenario
        console.log(`AppAPI Netflix : ColdLaunch`)
        if(Router.getActivePage().showSplashImage){
          Router.getActivePage().showSplashImage(callsign) //to make the splash image for netflix visible
        }
        if (url) {
          try {
            console.log("AppAPI Netflix ColdLaunch passing netflix url & IIDqueryString using configureApplication method:  ", url, IIDqueryString);
            await this.configureApplication("Netflix", url + IIDqueryString);
          } catch (err) {
            console.error("AppAPI Netflix configureApplication error: ", err);
          }
        } else {
          try {
            console.log("AppAPI Netflix ColdLaunch passing netflix IIDqueryString using configureApplication method:  ", IIDqueryString);
            await this.configureApplication("Netflix", IIDqueryString);
          } catch (err) {
            console.error("AppAPI Netflix configureApplication error: ", err);
          }
        }
      } else { //netflix hot launch scenario
        console.log("AppAPI Netflix : HotLaunch")
        if (url) {
          try {
            console.log("AppAPI Netflix HotLaunch passing netflix url & IIDqueryString using systemcommand method: ", url, IIDqueryString);
            await thunder.call("Netflix", "systemcommand", { command: url + IIDqueryString });
          } catch (err) {
            console.error("AppAPI Netflix systemcommand error: ", err);
          }
        }
        else {
          try {
            console.log("AppAPI Netflix HotLaunch passing netflix IIDqueryString using systemcommand method: ", IIDqueryString);
            await thunder.call("Netflix", "systemcommand", { command: IIDqueryString });
          } catch (err) {
            console.error("AppAPI Netflix systemcommand error: ", err);
          }
        }
      }
    }

    let params = {
      "callsign": callsign,
      "type": callsign,
      "configuration":{}
    };
    if (url && (callsign==="LightningApp" || callsign === "HtmlApp" || callsign === "NativeApp")) { //for lightning/htmlapp url is passed via rdkshell.launch method
      params.uri = url
    } else if(callsign.startsWith("YouTube")){
      let language = localStorage.getItem("Language");
      language = availableLanguageCodes[language] ? availableLanguageCodes[language] : "en-US" //default to english US if language is not available.
      if (gracenoteUrl === null) {
        url = url ? url : Storage.get(callsign+"DefaultURL");
      } else {
        /* Gracenote provided url cannot be used for 'Configuring' plugin. Use only to deeplink. */
        url = Storage.get(callsign+"DefaultURL");
      }
      if(url){
        if (!url.includes("?")){
          url += "?"
        }
        if (!url.includes("inApp=")) {
          if (!url.endsWith("&")) {
            url += "&"
          }
          url += ((Storage.get("appplicationType") === callsign)? "inApp=true":"inApp=false")
        }
        if (!url.includes("launch=")) {
          if (!url.endsWith("&")) {
            url += "&"
          }
          url += "launch=" + launchLocation
        }
        if ((launchLocation === "voice") && !url.includes("vs=")) {
          if (!url.endsWith("&")) {
            url += "&"
          }
          url += "vs=2" // YT Dev Doc specific to Alexa
        }
        console.log("AppAPI "+callsign+" is being launched using the url: "+url)
      }

      params.configuration = { //for gracenote cold launch url needs to be re formatted to youtube.com/tv/
        "language": language,
        "url": url,
        "launchtype":"launch=" + launchLocation
      }
      params.type = "Cobalt";
    }

    else if(callsign === "Amazon"){
      let language = localStorage.getItem("Language");
      language = availableLanguageCodes[language] ? availableLanguageCodes[language] : "en-US"
      params.configuration= { "deviceLanguage" : language};
    }
    else if(callsign === "Netflix"){
      let language = localStorage.getItem("Language");
      language = availableLanguageCodes[language] ? availableLanguageCodes[language] : "en-US"
      params.configuration ={"language" : language};
    }

    if (!preventCurrentExit && (currentApp !== "") && (currentApp !== callsign)) { //currentApp==="" means currently on residentApp | make currentApp = "residentApp" in the cache and stack
      try {
        console.log("AppAPI calling exitApp with params: " + callsign +" and exitInBackground " + currentApp +" true.")
        await this.exitApp(currentApp, true)
      }
      catch (err) {
        console.error("AppAPI currentApp " + currentApp + " exit failed!: launching new app...")
      }
    }

    if (currentApp === "" && callsign !== "Netflix") { //currentApp==="" means currently on residentApp | make currentApp = "residentApp" in the cache and stack | for netflix keep the splash screen visible till it launches
      thunder.call('org.rdk.RDKShell', 'setVisibility', {
        "client": "ResidentApp",
        "visible": false,
      })
    }

    if(callsign === "Netflix"){ //special case for netflix to show splash screen
      params.behind = "ResidentApp" //to make the app launch behind resident app | app will be moved to front after first frame event is triggered
    }
    if (JSON.stringify(params.configuration) === '{}') {
      delete params.configuration;
    }
    console.log("AppAPI RDKShell launch with params: ", params);
    return new Promise((resolve, reject) => {
      if (callsign === "NativeApp") {
        // Could be coming from PartnerApp.
        params.client = callsign;
        params.mimeType = "application/native";
        thunder.call("org.rdk.RDKShell", "launchApplication", params).then(res => {
          console.log(`AppAPI ${callsign} : Launch results in ${JSON.stringify(res)}`)
          if (res.success) {
            for (let [key, value] of Object.entries(AlexaLauncherKeyMap)) {
              if (value.callsign === callsign) {
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
            if(args.appIdentifier){
              let order = Storage.get("appCarouselOrder")
              if(!order){
                Storage.set("appCarouselOrder" , "")
              } else {
                let storedApps = order.split(",")
                let ix = storedApps.indexOf(args.appIdentifier)
                if(ix != -1){
                  storedApps.splice(ix , 1)
                }
                storedApps.unshift(args.appIdentifier)
                Storage.set("appCarouselOrder" , storedApps.toString())
              }
            }
            Storage.set("applicationType", callsign);
            resolve(res);
          } else {
            console.error("AppAPI failed to launchApp(success false) : ", callsign, " ERROR: ", JSON.stringify(res))
            Router.navigate(Storage.get("lastVisitedRoute"));
            reject(res)
          }
        }).catch(err => {
          console.error("AppAPI failed to launchApp: ", callsign, " ERROR: ", JSON.stringify(err), " | Launching residentApp back")
          thunder.call('org.rdk.RDKShell', 'kill', { "client": callsign });
          this.launchResidentApp();
          Router.navigate(Storage.get("lastVisitedRoute"));
          reject(err)
        })
      } else {
        thunder.call("org.rdk.RDKShell", "launch", params).then(res => {
          console.log(`AppAPI ${callsign} : Launch results in ${JSON.stringify(res)}`)
          if (res.success) {
            for (let [key, value] of Object.entries(AlexaLauncherKeyMap)) {
              if (value.callsign === callsign) {
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
            if(args.appIdentifier){
              let order = Storage.get("appCarouselOrder")
              if(!order){
                Storage.set("appCarouselOrder" , "")
              } else {
                let storedApps = order.split(",")
                let ix = storedApps.indexOf(args.appIdentifier)
                if(ix != -1){
                  storedApps.splice(ix , 1)
                }
                storedApps.unshift(args.appIdentifier)
                Storage.set("appCarouselOrder" , storedApps.toString())
              }
            }

            if(callsign !== "Netflix"){ //if app is not netflix, move it to front(netflix will be moved to front from applauncherScreen.)
              thunder.call("org.rdk.RDKShell", "moveToFront", {
                "client": callsign,
                "callsign": callsign
              }).catch(err => {
                console.error("AppAPI failed to moveToFront : ", callsign, " ERROR: ", JSON.stringify(err), " | fail reason can be since app is already in front")
              })
            }

            thunder.call("org.rdk.RDKShell", "setFocus", {
              "client": callsign,
              "callsign": callsign
            }).catch(err => {
              console.error("AppAPI failed to setFocus : ", callsign, " ERROR: ", JSON.stringify(err))
            })

            thunder.call("org.rdk.RDKShell", "setVisibility", {
              "client": callsign,
              "visible": true
            }).catch(err => {
              console.error("AppAPI failed to setVisibility : ", callsign, " ERROR: ", JSON.stringify(err))
            })

            if (callsign === "Netflix") {
              console.log("AppAPI Netflix launched: hiding residentApp");
              thunder.call('org.rdk.RDKShell', 'setVisibility', {
                "client": "ResidentApp",
                "visible": false,
              }); //if netflix splash screen was launched resident app was kept visible Netflix until app launched.
            }

            if (callsign.startsWith("YouTube") && ((res.launchType === "resume") || (gracenoteUrl != null))) {
              // Page visibility requirement; 'launch' need to be 'deeplink'ed when app is 'resumed'.
              if (gracenoteUrl != null) {
                url = gracenoteUrl;
              } else if (!url) {
                url = params.configuration.url;
              }
              console.log("AppAPI Calling "+callsign+".deeplink with url: " + url);
              thunder.call(callsign, 'deeplink', url)
            }

            Storage.set("applicationType", callsign);

            resolve(res);

          } else {
            console.error("AppAPI failed to launchApp(success false) : ", callsign, " ERROR: ", JSON.stringify(res))
            Router.navigate(Storage.get("lastVisitedRoute"));
            reject(res)
          }
        }).catch(err => {
          console.error("AppAPI failed to launchApp: ", callsign, " ERROR: ", JSON.stringify(err), " | Launching residentApp back")

          //destroying the app incase it's stuck in launching | if taking care of ResidentApp as callsign, make sure to prevent destroying it
          thunder.call('org.rdk.RDKShell', 'destroy', { "callsign": callsign });
          this.launchResidentApp();
          Router.navigate(Storage.get("lastVisitedRoute"));
          reject(err)
        })
      }
    })
  }


  /**
   * Function to launch Exit types of apps.
   * @param {String} callsign callsign of the particular app.
   * @param {boolean} exitInBackground to make the app not bring up residentApp on exit
   * @param {boolean} forceDestroy to force the app to do rdkshell.destroy instead of suspend
   */

  // exit method does not need to launch the previous app.
  async exitApp(callsign, exitInBackground, forceDestroy) { //test the new exit app method
    if (callsign === "") { //previousApp==="" means it's residentApp | change it to residentApp in cache and here
      return Promise.reject("AppAPI Can't exit from ResidentApp");
    }

    if (callsign === "HDMI") {
      console.log("AppAPI exit method called for hdmi")
      new HDMIApi().stopHDMIInput()
      Storage.set("_currentInputMode", {});
      if (!exitInBackground) { //means resident App needs to be launched
        this.launchResidentApp();
      }
      return Promise.resolve(true);
      //check for hdmi scenario
    }

    if (callsign === "LightningApp" || callsign === "HtmlApp" || callsign === "Peacock") {
      forceDestroy = true //html and lightning apps need not be suspended.
    }

    let pluginStatus, pluginState;// to check if the plugin is active, resumed, deactivated etc
    if (callsign != "NativeApp" && !callsign.includes('application/dac.native')) {
      try {
        pluginStatus = await this.getPluginStatus(callsign);
        if (pluginStatus !== undefined) {
          pluginState = pluginStatus[0].state;
          console.log("AppAPI pluginStatus: " + JSON.stringify(pluginStatus) + " pluginState: ", JSON.stringify(pluginState));
        }
        else {
          return Promise.reject("AppAPI PluginError: " + callsign + ": App not supported on this device");
        }
      } catch (err) {
        return Promise.reject("AppAPI PluginError: " + callsign + ": App not supported on this device | Error: " + JSON.stringify(err));
      }
    }

    if (!exitInBackground) { //means resident App needs to be launched
      this.launchResidentApp();
    }

    //to hide the current app
    console.log("AppAPI setting visibility of " + callsign + " to false")
    await thunder.call("org.rdk.RDKShell", "setVisibility", {
      "client": callsign,
      "visible": false
    }).catch(err => {
      console.error("AppAPI failed to setVisibility : " + callsign + " ERROR: ", JSON.stringify(err))
    })

    if (forceDestroy) {
      if (pluginState != undefined) { // App is a Plugin
        console.log("AppAPI Force Destroying the app: ", callsign)
        await thunder.call('org.rdk.RDKShell', 'destroy', { "callsign": callsign });
        return Promise.resolve(true);
      } else if (callsign === "NativeApp" || callsign.includes('application/dac.native')) {
        await thunder.call('org.rdk.RDKShell', 'kill', {"client": (callsign.includes('application/dac.native')? callsign.substring(0, callsign.indexOf(';')): callsign)}).then((res) => {
          console.log("AppAPI RDKShell kill: " + callsign + " RESPONSE: ", JSON.stringify(res))
          return Promise.resolve(true);
        }).catch(err => {
          console.error("AppAPI RDKShell kill: " + callsign + " ERROR: ", JSON.stringify(err))
          return Promise.resolve(false);
        });
      }
    }
    else {
      console.log("AppAPI Exiting from App: ", callsign, " depending on platform settings enableAppSuspended: ", Settings.get("platform", "enableAppSuspended"));
      //enableAppSuspended = true means apps will be suspended by default
      if (Settings.get("platform", "enableAppSuspended")) {
        if (pluginState != undefined) { // App is a Plugin
          await thunder.call('org.rdk.RDKShell', 'suspend', { "callsign": callsign }).catch(err => {
            console.error("AppAPI Error in suspending app: ", callsign, " | trying to destroy the app");
            thunder.call('org.rdk.RDKShell', 'destroy', { "callsign": callsign });
          })
          return Promise.resolve(true)
        } else if (callsign === "NativeApp" || callsign.includes('application/dac.native')) {
          // DAC Demo WorkAround; TODO: use suspendApplication instead of kill
          await thunder.call('org.rdk.RDKShell', 'kill', {"client": (callsign.includes('application/dac.native')? callsign.substring(0, callsign.indexOf(';')): callsign)}).catch(err => {
            console.error("AppAPI Error in kill app: ", callsign, " | trying to destroy the app");
            thunder.call('org.rdk.RDKShell', 'destroy', { "callsign": callsign });
          })
          return Promise.resolve(true)
        }
      }
      else {
        await thunder.call('org.rdk.RDKShell', 'destroy', { "callsign": callsign });
        return Promise.resolve(true);
      }
    }
  }

  /**
   * Function to launch ResidentApp explicitly(incase of special scenarios)
   * Prefer using launchApp and exitApp for ALL app launch and exit scenarios.
   */
  async launchResidentApp() {
    console.log("AppAPI launchResidentApp got Called: setting visibility, focus and moving to front the ResidentApp")
    await thunder.call("org.rdk.RDKShell", "moveToFront", {
      "client": "ResidentApp",
      "callsign": "ResidentApp"
    }).catch(err => {
      console.error("AppAPI failed to moveToFront : ResidentApp ERROR: ", JSON.stringify(err), " | fail reason can be since app is already in front")
    })

    await thunder.call("org.rdk.RDKShell", "setFocus", {
      "client": "ResidentApp",
      "callsign": "ResidentApp"
    }).catch(err => {
      console.error("AppAPI failed to setFocus : ResidentApp ERROR: ", JSON.stringify(err))
    })

    await thunder.call("org.rdk.RDKShell", "setVisibility", {
      "client": "ResidentApp",
      "visible": true
    }).catch(err => {
      console.error("AppAPI failed to setVisibility : ResidentApp ERROR: ", JSON.stringify(err))
    })

    Storage.set("applicationType", ""); //since it's residentApp aplication type is "" | change application type to ResidentApp
  }


  async getNetflixIIDs() {
    let defaultIIDs = NetflixIIDs;
    let data = new HomeApi().getPartnerAppsInfo();
    if (!data) {
      return defaultIIDs;
    }
    console.log("AppAPI homedata: ", data);
    try {
      data = await JSON.parse(data);
      if (data != null && data.hasOwnProperty("netflix-iid-file-path")) {
        let url = data["netflix-iid-file-path"]
        console.log(`AppAPI Netflix : requested to fetch iids from `, url)
        const fetchResponse = await fetch(url);
        const fetchData = await fetchResponse.json();
        return fetchData;
      } else {
        console.log("AppAPI Netflix IID file path not found in conf file, using deffault IIDs");
        return defaultIIDs;
      }
    } catch (err) {
      console.error("AppAPI Error in fetching iid data from specified path, returning defaultIIDs | Error:", err);
      return defaultIIDs;
    }
  }

  /*
   *Function to launch apps in hidden mode
   */
  launchPremiumAppInSuspendMode(childCallsign) {
    return new Promise((resolve, reject) => {
      thunder
        .call("org.rdk.RDKShell", "launch", {
          callsign: childCallsign,
          type: childCallsign,
          suspend: true,
          visible: false,
          focused: false,
        })
        .then((res) => {

          if (childCallsign == "Netflix") {
            console.log(`AppAPI launchPremiumAppInSuspendMode : launch netflix results in :`, res);
          }
          else {
            console.log(`AppAPI launchPremiumAppInSuspendMode : launch amazon results in :`, res);
          }
          resolve(true)
        })
        .catch(err => {
          if (childCallsign == "Netflix") {
            console.error(`AppAPI Netflix : error while launching netflix :`, err);
          }
          else {
            console.log(`AppAPI Amazon : error while launching amazon :`, err);
          }
          reject(false)
        });
    })
  }

  /**
   * Function to launch Netflix/Amazon Prime app.
   */
  launchPremiumApp(childCallsign) {
    return new Promise((resolve, reject) => {
      thunder
        .call("org.rdk.RDKShell", "launch", {
          callsign: childCallsign,
          type: childCallsign,
          visible: true,
          focused: true
        })
        .then((res) => {
          if (childCallsign == "Netflix") {
            console.log(`AppAPI launchPremiumApp : launch netflix results in :`, res);
          }
          else {
            console.log(`AppAPI launchPremiumApp : launch amazon results in :`, res);
          }
          this.setVisibility(childCallsign, true)
          this.zorder(childCallsign)
          Storage.set("applicationType", childCallsign)
          console.log(`AppAPI launchPremiumApp the current application Type : `, Storage.get("applicationType"));
          resolve(true)
        })
        .catch(err => {
          if (childCallsign == "Netflix") {
            console.error(`AppAPI launchPremiumApp : error while launching netflix :`, err);
          }
          else {
            console.error(`AppAPI launchPremiumApp : error while launching amazon :`, err);
          }
          reject(false)
        });
    })
  }

  /**
   * Function to launch Resident app.
   * @param {String} url url of app.
   */
  launchResident(url, client) {
    return new Promise((resolve, reject) => {
      const childCallsign = client
      thunder
        .call('org.rdk.RDKShell', 'launch', {
          callsign: childCallsign,
          type: 'ResidentApp',
          uri: url,
        })
        .then((res) => {
          console.log(`AppAPI launchResident returned: `, JSON.stringify(res));
          resolve(true)
        })
        .catch(err => {
          console.error('AppAPI launchResident error: ' + JSON.stringify(err))
          reject(false)
        })
    })
  }

  launchOverlay(url, client) {
    return new Promise(resolve => {
      const childCallsign = client
      thunder
        .call('org.rdk.RDKShell', 'launch', {
          callsign: childCallsign,
          type: 'ResidentApp',
          uri: url,
        })
        .then(res => {
          thunder.call('org.rdk.RDKShell', 'moveToFront', {
            client: childCallsign,
          })
          console.log(`AppAPI launchOverlay : launched overlay : `, JSON.stringify(res));
          resolve(res)
        })
        .catch(err => {
          console.error("AppAPI launchOverlay : error ", JSON.stringify(err))
          reject(err)
        })
    })
  }

  /**
   * Function to suspend Netflix/Amazon Prime app.
   */
  suspendPremiumApp(appName) {
    return new Promise((resolve, reject) => {
      thunder.call('org.rdk.RDKShell', 'suspend', { callsign: appName }).then(res => {
        resolve(true);
      })
        .catch(err => {
          console.error("AppAPI suspendPremiumApp error: ", JSON.stringify(err));
          resolve(false)
        })
    })
  }

  /**
   * Function to deactivate html app.
   */
  deactivateWeb() {
    thunder.call('org.rdk.RDKShell', 'destroy', { callsign: 'HtmlApp' })
  }

  /**
   * Function to deactivate cobalt app.
   */
  deactivateCobalt(instanceName = 'Cobalt') {
    thunder.call('org.rdk.RDKShell', 'destroy', { callsign: instanceName })
  }

  cobaltStateChangeEvent() {
    try {
      thunder.on('Controller', 'statechange', notification => {
        if (this._events.has('statechange')) {
          this._events.get('statechange')(notification)
        }
      })
    } catch (e) {
      console.error('AppAPI Failed to register statechange event' + e)
    }
  }

  /**
   * Function to deactivate lightning app.
   */
  deactivateLightning() {
    thunder.call('org.rdk.RDKShell', 'destroy', { callsign: 'Lightning' })
  }

  /**
   * Function to deactivate resident app.
   */
  deactivateResidentApp(client) {
    thunder.call('org.rdk.RDKShell', 'destroy', { callsign: client })
  }

  /**
   * Function to set visibility to client apps.
   * @param {client} client client app.
   * @param {visible} visible value of visibility.
   */
  setVisibility(client, visible) {
    return new Promise((resolve, reject) => {
      thunder.call('org.rdk.RDKShell', 'setVisibility', {
        client: client,
        visible: visible,
      })
      if (visible) {
        thunder.call('org.rdk.RDKShell', 'setFocus', { client: client })
          .then(res => {
            resolve(true)
          })
          .catch(err => {
            console.error('AppAPI Set focus error', JSON.stringify(err))
            reject(false)
          })
      }
    })
  }

  visible(client, visible) {
    return new Promise((resolve, reject) => {
      thunder.call('org.rdk.RDKShell', 'setVisibility', {
        client: client,
        visible: visible,
      })
    })
  }

  enabledisableinactivityReporting(bool) {
    return new Promise((resolve, reject) => {
      thunder
        .call('org.rdk.RDKShell', 'enableInactivityReporting', {
          "enable": bool
        })
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          console.error("AppAPI error in getting sound mode:", JSON.stringify(err, 3, null))
          reject(err)
        });
    })
  }

  setInactivityInterval(duration) {
    return new Promise((resolve, reject) => {
      thunder
        .call('org.rdk.RDKShell', 'setInactivityInterval', {
          "interval": duration
        })
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          console.error("AppAPI RDKShell setInactivityInterval error.");
          reject(false)
        });
    })
  }

  zorder(cli) {
    thunder.call('org.rdk.RDKShell', 'moveToFront', { client: cli, callsign: cli })
  }

  setFocus(cli) {
    thunder.call('org.rdk.RDKShell', 'setFocus', { client: cli })
  }

  moveToBack(cli) {
    thunder.call('org.rdk.RDKShell', 'moveToBack', { client: cli })
  }
  setOpacity(cli, opacity){
    thunder.call('org.rdk.RDKShell', 'setOpacity', { client: cli , opacity: opacity})
  }

  /**
 * Function to set the configuration of premium apps.
 * @param {appName} Name of the application
 * @param {config_data} config_data configuration data
 */
  configureApplication(appName, config_data) {
    let plugin = 'Controller';
    let method = 'configuration@' + appName;
    return new Promise((resolve, reject) => {
      thunder.call(plugin, method).then((res) => {
        res.querystring = config_data;
        thunder.call(plugin, method, res).then((resp) => {
          console.log(`AppAPI ${appName} : updating configuration with object ${res} results in ${resp}`)
          resolve(true);
        }).catch((err) => {
          reject(err); //resolve(true)
        });
      }).catch((err) => {
        reject(err);
      });
    })
  }

  setPowerState(value) {
    return new Promise((resolve, reject) => {
      thunder
        .call('org.rdk.System', 'setPowerState', { "powerState": value, "standbyReason": "ResidentApp User Requested" })
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          console.error("AppAPI System setPowerState failed: ", JSON.stringify(err));
          resolve(false)
        })
    })
  }

  getPowerState() {
    return new Promise((resolve, reject) => {
      thunder
        .call('org.rdk.System', 'getPowerState')
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          console.error("AppAPI System getPowerState failed: ", JSON.stringify(err));
          reject(err)
        })
    })
  }

  getWakeupReason() {
    return new Promise((resolve, reject) => {
      thunder
        .call('org.rdk.System', 'getWakeupReason')
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          console.log("org.rdk.System: getWakeupReason: Error in getting wake up reason: ",err)
          reject(err)
        })
    })
  }

  enableDisplaySettings() {
    return new Promise((resolve, reject) => {
      thunder.call('Controller', 'activate', { callsign: 'org.rdk.DisplaySettings' })
        .then(result => {
          console.log('AppAPI activate DisplaySettings success.')
          resolve(result)
        })
        .catch(err => {
          console.error('AppAPI activate DisplaySettings error: ', JSON.stringify(err))
          reject(err)
        })
    })
  }

  getSoundMode() {
    return new Promise((resolve, reject) => {
      thunder
        .call('org.rdk.DisplaySettings', 'getSoundMode', {
          "audioPort": "HDMI0"
        })
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          console.error("AppAPI DisplaySettings getSoundMode error:", JSON.stringify(err, 3, null))
          resolve(false)
        })
    })
  }

  setSoundMode(mode) {
    mode = mode.startsWith("AUTO") ? "AUTO" : mode
    console.log("mode", mode)
    return new Promise((resolve, reject) => {
      thunder
        .call('org.rdk.DisplaySettings', 'setSoundMode', {
          "audioPort": "HDMI0",
          "soundMode": mode,
          "persist": true
        })
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          console.error("AppAPI DisplaySettings setSoundMode error:", JSON.stringify(err, 3, null))
          resolve(false)
        })
    })
  }

  getSupportedAudioModes() {
    return new Promise((resolve, reject) => {
      thunder
        .call('org.rdk.DisplaySettings', 'getSupportedAudioModes', {
          "audioPort": "HDMI0"
        })
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          console.error("AppAPI DisplaySettings getSupportedAudioModes error:", JSON.stringify(err, 3, null))
          reject(false)
        })
    })
  }

  //Enable or disable the specified audio port based on the input audio port ID.
  setEnableAudioPort(port) {
    return new Promise((resolve, reject) => {
      thunder
        .call('org.rdk.DisplaySettings', 'setEnableAudioPort', {
          "audioPort": port, "enable": true
        })
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          console.error("AppAPI DisplaySettings setEnableAudioPort error:", JSON.stringify(err, 3, null))
          resolve(false)
        })
    })
  }

  getDRCMode() {
    return new Promise((resolve, reject) => {
      thunder
        .call('org.rdk.DisplaySettings', 'getDRCMode', { "audioPort": "HDMI0" })
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          console.error("AppAPI DisplaySettings getDRCMode error:", JSON.stringify(err))
          resolve(false)
        })
    })
  }

  setDRCMode(DRCNum) {
    return new Promise((resolve, reject) => {
      thunder
        .call('org.rdk.DisplaySettings', 'setDRCMode', {
          "DRCMode": DRCNum
        })
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          console.error("AppAPI DisplaySettings setDRCMode error:", JSON.stringify(err))
          resolve(false)
        })
    })
  }

  getZoomSetting() {
    return new Promise((resolve, reject) => {
      thunder
        .call('org.rdk.DisplaySettings', 'getZoomSetting')
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          console.error("AppAPI DisplaySettings getZoomSetting error:", JSON.stringify(err))
          resolve(false)
        })
    })
  }

  setZoomSetting(zoom) {
    return new Promise((resolve, reject) => {
      thunder
        .call('org.rdk.DisplaySettings', 'setZoomSetting', { "zoomSetting": zoom })
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          console.error("AppAPI DisplaySettings setZoomSetting error:", JSON.stringify(err))
          resolve(false)
        })
    })
  }

  getEnableAudioPort(audioPort) {
    return new Promise((resolve, reject) => {
      thunder
        .call('org.rdk.DisplaySettings', 'getEnableAudioPort', { "audioPort": audioPort })
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          console.error("AppAPI DisplaySettings getEnableAudioPort error:", JSON.stringify(err))
          resolve(false)
        })
    })
  }

  getSupportedAudioPorts() {
    return new Promise((resolve, reject) => {
      thunder
        .call('org.rdk.DisplaySettings', 'getSupportedAudioPorts')
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          console.error("AppAPI DisplaySettings getSupportedAudioPorts error:", JSON.stringify(err))
          resolve(false)
        })
    })
  }

  //________________________________________________________________________________________________________________________

  //OTHER SETTINGS PAGE API

  //1. UI VOICE

  //Start a speech
  ttsSpeak() {
    return new Promise((resolve, reject) => {
      thunder
        .call('org.rdk.TextToSpeech', 'speak', {
          "text": "speech_1"
        })
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          console.error("AppAPI TextToSpeech speak error:", JSON.stringify(err, 3, null))
          resolve(false)
        })
    })
  }

  //Resume a speech
  ttsResume() {
    return new Promise((resolve, reject) => {
      thunder
        .call('org.rdk.TextToSpeech', 'resume', {
          "speechid": 1
        })
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          console.error("AppAPI TextToSpeech resume error:", JSON.stringify(err, 3, null))
          resolve(false)
        })
    })
  }

  //Pause a speech
  ttsPause() {
    return new Promise((resolve, reject) => {
      thunder
        .call('org.rdk.TextToSpeech', 'pause', {
          "speechid": 1
        })
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          console.error("AppAPI TextToSpeech pause error:", JSON.stringify(err, 3, null))
          resolve(false)
        })
    })
  }

  // 2. TTS Options
  ttsGetListVoices() {
    return new Promise((resolve, reject) => {
      thunder
        .call('org.rdk.TextToSpeech', 'listvoices', {
          "language": "en-US"
        })
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          console.error("AppAPI TextToSpeech listvoices error:", JSON.stringify(err, 3, null))
          resolve(false)
        })
    })
  }

  // 3. Sync Location
  syncLocation() {
    return new Promise((resolve, reject) => {
      thunder
        .call('LocationSync', 'sync')
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          console.error("AppAPI LocationSync sync error:", JSON.stringify(err, 3, null))
          resolve(false)
        })
    })
  }

  getLocation() {
    return new Promise((resolve, reject) => {
      thunder
        .call('LocationSync', 'location')
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          console.error("AppAPI LocationSync location error:", JSON.stringify(err, 3, null))
          resolve(false)
        })
    })
  }
  // 4. Check for Firmware Update

  //Get Firmware Update Info
  getFirmwareUpdateInfo() {
    return new Promise((resolve, reject) => {
      thunder
        .call('org.rdk.System', 'getFirmwareUpdateInfo')
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          console.error("AppAPI System getFirmwareUpdateInfo error:", JSON.stringify(err, 3, null))
          resolve(false)
        })
    })
  }

  // Get Firmware Update State
  getFirmwareUpdateState() {
    return new Promise((resolve, reject) => {
      thunder
        .call('org.rdk.System', 'getFirmwareUpdateState')
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          console.error(" AppAPI System getFirmwareUpdateState error:", JSON.stringify(err, 3, null))
          resolve(false)
        })
    })
  }

  // Get Firmware download info
  getDownloadFirmwareInfo() {
    return new Promise((resolve, reject) => {
      thunder
        .call('org.rdk.System', 'getDownloadedFirmwareInfo')
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          console.error("AppAPI System getDownloadedFirmwareInfo error:", JSON.stringify(err, 3, null))
          resolve(false)
        })
    })
  }

  getModelName() {
    return new Promise((resolve, reject) => {
      thunder.call('DeviceInfo', 'modelname').then(result => {
        resolve(result.model)
	    }).catch(err => {
        console.error("AppAPI DeviceInfo modelname failed:", err);
        resolve("RDK-VA")
      })
    })
  }

  getSerialNumber() {
    return new Promise((resolve, reject) => {
      thunder.call('DeviceInfo', 'serialnumber').then(result => {
        resolve(result.serialnumber)
      }).catch(err => {
        console.error("AppAPI DeviceInfo serialnumber error:", JSON.stringify(err, 3, null));
        resolve('0123456789')
      })
    })
  }

  //Get system versions
  getSystemVersions() {
    return new Promise((resolve, reject) => {
      thunder
        .call('org.rdk.System', 'getSystemVersions')
        .then(result => {
          console.log(JSON.stringify(result, 3, null))
          resolve(result)
        })
        .catch(err => {
          console.error("AppAPI System getSystemVersions error:", JSON.stringify(err, 3, null))
          resolve(false)
        })
    })
  }

  //Update firmware
  updateFirmware() {
    return new Promise((resolve, reject) => {
      thunder
        .call('org.rdk.System', 'updateFirmware')
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          console.error("AppAPI System updateFirmware error:", JSON.stringify(err, 3, null))
          resolve(false)
        })
    })
  }

  //Get download percentage
  getFirmwareDownloadPercent() {
    return new Promise((resolve, reject) => {
      thunder
        .call('org.rdk.System', 'getFirmwareDownloadPercent')
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          console.error("AppAPI getFirmwareDownloadPercent error:", JSON.stringify(err, 3, null))
          resolve(false)
        })
    })
  }

  // device Identification
  getDeviceIdentification() {
    return new Promise((resolve, reject) => {
      thunder
        .call('DeviceIdentification', 'deviceidentification')
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          console.error("AppAPI getDeviceIdentification error:", JSON.stringify(err, 3, null))
          resolve(false)
        })
    })
  }

  // 5. Device Info
  systeminfo() {
    return new Promise((resolve, reject) => {
      thunder
        .call('DeviceInfo', 'systeminfo')
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          console.error("AppAPI systeminfo error:", JSON.stringify(err, 3, null))
          resolve(false)
        })
    })
  }

  deviceType() {
    return new Promise((resolve, reject) => {
      thunder
        .call('DeviceInfo', 'devicetype')
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          console.error("AppAPI devicetype error:", JSON.stringify(err, 3, null))
          resolve(false)
        })
    })
  }

  // 6. Reboot
  reboot() {
    return new Promise((resolve, reject) => {
      thunder
        .call('org.rdk.System', 'reboot', {
          "rebootReason": "FIRMWARE_FAILURE"
        })
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          console.error("AppAPI reboot error:", JSON.stringify(err, 3, null))
          resolve(false)
        })
    })
  }

  getNetflixESN() {
    return new Promise((resolve) => {
      thunder.call('Netflix', 'esn')
        .then(res => {
          resolve(res)
        })
    })
  }

  // get prefered standby mode
  getPreferredStandbyMode() {
    return new Promise((resolve, reject) => {
      thunder
        .call('org.rdk.System', 'getPreferredStandbyMode').then(result => {
          resolve(result)
        })
        .catch(err => {
          console.error("AppAPI getPreferredStandbyMode error:", JSON.stringify(err, 3, null))
          resolve(false)
        })
    })
  }

  setPreferredStandbyMode(standbyMode) {
    console.log("setPreferredStandbyMode called : " + standbyMode)
    return new Promise((resolve, reject) => {
      thunder
        .call('org.rdk.System', 'setPreferredStandbyMode', {
          "standbyMode": standbyMode
        }).then(result => {
          resolve(result)
        })
        .catch(err => {
          console.error("AppAPI setPreferredStandbyMode error:", JSON.stringify(err, 3, null))
          resolve(false)
        })
    })
  }

  registerChangeLocation() {
    thunder
      .call('Controller', 'activate', { callsign: "LocationSync" })
      .then(result => {
        thunder.on("LocationSync", "locationchange", notification => {
          console.log("AppAPI locationchange notification :", notification);
        })
      }).catch(err => {
        console.error(err)
      })
  }

  async sendAppState(value) {
    const state = await thunder
      .call('org.rdk.RDKShell', 'getState', {})
      .then(result => result.state);
    this.state = state;
    let params = { applicationName: value, state: 'stopped' };
    for (let i = 0; i < state.length; i++) {
      if (state[i].callsign == value) {
        if (state[i].state == 'resumed') {
          params.state = 'running';
        } else if (state[i].state == 'suspended') {
          params.state = 'suspended';
        } else {
          params.state = 'stopped'
        };
      }
    }
    await thunder
      .call('org.rdk.Xcast', 'onApplicationStateChanged', params)
      .then(result => result.success);
  }
  //NETWORK INFO APIS

  //1. Get IP Setting
  getIPSetting(defaultInterface) {
    return new Promise((resolve, reject) => {
      thunder
        .call('org.rdk.Network', 'getIPSettings', {
          "interface": defaultInterface,
        })
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          console.error("AppAPI getIPSetting error:", JSON.stringify(err, 3, null))
          resolve(false)
        })
    })
  }

  //2. Get default interface
  getDefaultInterface() {
    return new Promise((resolve, reject) => {
      thunder
        .call('org.rdk.Network', 'getDefaultInterface')
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          console.error("AppAPI getDefaultInterface error:", JSON.stringify(err, 3, null))
          resolve(false)
        })
    })
  }

  //3. Is interface enabled
  isInterfaceEnabled() {
    return new Promise((resolve, reject) => {
      thunder
        .call('org.rdk.Network', 'isInterfaceEnabled', {
          "interface": "WIFI"
        })
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          console.error("AppAPI isInterfaceEnabled error:", JSON.stringify(err, 3, null))
          resolve(false)
        })
    })
  }

  //4. Get interfaces
  getInterfaces() {
    return new Promise((resolve, reject) => {
      thunder
        .call('org.rdk.Network', 'getInterfaces')
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          console.error("AppAPI getInterfaces error:", JSON.stringify(err, 3, null))
          resolve(false)
        })
    })
  }

  //5. getConnectedSSID
  getConnectedSSID() {
    return new Promise((resolve, reject) => {
      thunder
        .call('org.rdk.Wifi', 'getConnectedSSID')
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          console.error("AppAPI getConnectedSSID error:", JSON.stringify(err, 3, null))
          resolve(false)
        })
    })
  }

  // Volume Apis
  getConnectedAudioPorts() {
    return new Promise((resolve, reject) => {
      thunder
        .call('org.rdk.DisplaySettings', 'getConnectedAudioPorts', {})
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          console.error('AppAPI getConnectedAudioPorts error:', JSON.stringify(err, 3, null))
          reject(false)
        })
    })
  }

  getVolumeLevel(port) {
    return new Promise((resolve, reject) => {
      thunder
        .call('org.rdk.DisplaySettings', 'getVolumeLevel', {
          audioPort: port,
        })
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          console.error('AppAPI getVolumeLevel error:', JSON.stringify(err, 3, null))
          reject(false)
        })
    })
  }

  muteStatus(port) {
    return new Promise((resolve, reject) => {
      thunder
        .call('org.rdk.DisplaySettings', 'getMuted', {
          audioPort: port,
        })
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          console.error('AppAPI getMuted error:', JSON.stringify(err, 3, null))
          reject(false)
        })
    })
  }

  setVolumeLevel(port, volume) {
    return new Promise((resolve, reject) => {
      thunder
        .call('org.rdk.DisplaySettings', 'setVolumeLevel', {
          audioPort: port,
          volumeLevel: volume,
        })
        .then(result => {
          console.log("AppAPI setVolumeLevel :", JSON.stringify(result))
          resolve(result)
        })
        .catch(err => {
          console.error('AppAPI setVolumeLevel error:', JSON.stringify(err))
          resolve(false)
        })
    })
  }

  audio_mute(audio_source, value) {
    return new Promise((resolve, reject) => {
      thunder
        .call('org.rdk.DisplaySettings', 'setMuted', {
          audioPort: audio_source,
          muted: value,
        })
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          console.error('AppAPI audio_mute setMuted error:', JSON.stringify(err, 3, null))
          resolve(false)
        })
    })
  }
 //created only to get the required params
  getPluginStatusParams(plugin) {
    return new Promise((resolve, reject) => {
      thunder.call('Controller', `status@${plugin}`)
        .then(result => {
          console.log("pluginstatus",result)
          let pluginParams=[result[0].callsign,result[0].state]
          resolve(pluginParams)
        })
        .catch(err => {
          console.error("AppAPI getPluginStatusParams error: ",err)
          reject(err)
        })
    })
  }
//activate autopairing for stack
  activateAutoPairing(){
    return new Promise((resolve, reject) => {
      thunder
        .call('org.rdk.RemoteControl', 'startPairing', {
          "netType": '1',
          "timeout": '30'
        })
        .then(result => {
          console.log("AppAPI activateAutoPairing: ", result)
          resolve(result)
        })
        .catch(err => {
          console.error('AppAPI activateAutoPairing error:', JSON.stringify(err, 3, null))
          resolve(false)
        })
    })
   }
   resetBassEnhancer(port) {
    console.log("portname", port)
    return new Promise((resolve, reject) => {
      thunder
        .call('org.rdk.DisplaySettings', 'resetBassEnhancer', {
          "audioPort": port
        })
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          console.error("AppAPI resetBassEnhancer error: ", err)
          resolve(false)
        });
    })

  }
  resetDialogEnhancement(port){
    return new Promise((resolve, reject) => {
      thunder
        .call('org.rdk.DisplaySettings', 'resetDialogEnhancement', {
          "audioPort": port
        })
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          console.error("AppAPI resetDialogEnhancement error:", err)
          resolve(false)
        });
    })
  }
  //resetSurroundVirtualizer
  resetSurroundVirtualizer(port){
    return new Promise((resolve, reject) => {
      thunder
        .call('org.rdk.DisplaySettings', 'resetSurroundVirtualizer', {
          "audioPort": port
        })
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          console.error("AppAPI resetSoundVitualizer error:", err)
          resolve(false)
        });
    })
  }
  //resetVolumeLeveller
  resetVolumeLeveller(port){
    return new Promise((resolve, reject) => {
      thunder
        .call('org.rdk.DisplaySettings', 'resetVolumeLeveller', {
          "audioPort": port
        })
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          console.error("AppAPI resetvolumeLevel error:", err)
          resolve(false)
        });
    })
  }
  flushcache() {
    return new Promise((resolve) => {
      thunder
        .call('org.rdk.PersistentStore', 'flushCache')
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          console.error("AppAPI flushCache error:", err)
          resolve(false)
        })
    })
  }
  //resetInactivityTime
  resetInactivityTime() {
    return new Promise((resolve) => {
      thunder
        .call('org.rdk.RDKShell', 'resetInactivityTime')
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          console.error("AppAPI resetInactivityTime error:", err)
          resolve(false)
        })
    })
  }
//clearLastDeepSleepReason
clearLastDeepSleepReason() {
  return new Promise((resolve) => {
    thunder
      .call('org.rdk.System', 'clearLastDeepSleepReason')
      .then(result => {
        resolve(result)
      })
      .catch(err => {
        console.error("AppAPI clearLastDeepSleepReason error:", err)
        resolve(false)
      })
  })
}
getSupportedAudioPorts() {
  return new Promise((resolve, reject) => {
    thunder
      .call('org.rdk.DisplaySettings', 'getSupportedAudioPorts')
      .then(result => {
        resolve(result)
      })
      .catch(err => {
        console.error("AppAPI getSupportedAudioPorts error:", err)
        resolve(false)
      });
  })
}

monitorStatus(callsign) {
  return new Promise((resolve, reject) => {
    thunder
      .call('Monitor', 'resetstats',{
        "callsign" : callsign
      })
      .then(result => {
        resolve(result)
      })
      .catch(err => {
        console.error("AppAPI monitorStatus error:", err)
        resolve(false)
      });
  })
}

// warehouse api's
internalReset() {
  return new Promise((resolve, reject) => {
    thunder
      .call('org.rdk.Warehouse', 'internalReset',{
        "passPhrase": "FOR TEST PURPOSES ONLY"
    })
      .then(result => {
        resolve(result)
      })
      .catch(err => {
        console.error("AppAPI interalReset error:", err)
        resolve(false)
      });
  })
}

isClean() {
  return new Promise((resolve, reject) => {
    thunder
      .call('org.rdk.Warehouse', 'isClean')
      .then(result => {
        resolve(result)
      })
      .catch(err => {
        console.error("AppAPI isClean error:", err)
        resolve(false)
      });
  })
}

lightReset() {
  return new Promise((resolve, reject) => {
    thunder
      .call('org.rdk.Warehouse', 'lightReset')
      .then(result => {
        resolve(result)
      })
      .catch(err => {
        console.error("AppAPI lightReset error:", err)
        resolve(false)
      });
  })
}

resetDevice() {
  return new Promise((resolve, reject) => {
    thunder
      .call('org.rdk.Warehouse', 'resetDevice',{
        "suppressReboot": false,
        "resetType": "USERFACTORY"
    })
      .then(result => {
        resolve(result)
      })
      .catch(err => {
        console.error("AppAPI resetDevice error:", err)
        resolve(false)
      });
  })
}

//{ path: ".cache" }
deletecache(systemcCallsign, path) {
  return new Promise((resolve, reject) => {
    thunder.call(systemcCallsign,'delete',{path: path})
      .then(result => {
        resolve(result)
      })
      .catch(err => {
        console.error("AppAPI deletecache error:", err)
        resolve(false)
      });
  })
}

// activate controller plugin
activateController(callsign){
  return new Promise((resolve, reject) => {
    thunder
    .call('Controller', 'activate', { callsign: callsign })
      .then(result => {
        resolve(result)
      })
      .catch(err => {
        console.error("AppAPI activateController error:", err)
        resolve(false)
      });
  })
}

checkStatus(plugin) {
  return new Promise((resolve, reject) => {
    thunder.call('Controller', 'status@' + plugin).then(res => {
      console.log("AppAPI checkStatus ", JSON.stringify(res))
      resolve(res)
    }).catch(err => {
      console.error("AppAPI checkStatus error:", err)
      resolve(false)
    });
  })
}

configStatus(){
//controller.1.configuration
return new Promise((resolve, reject) => {
  thunder.call('Controller', 'status').then(res => {
      console.log("AppAPI configStatus ",JSON.stringify(res))
      resolve(res)
    }).catch(err => {
      console.error("AppAPI configStatus error:", err)
      resolve(false)
    });
  })
}

getAvCodeStatus(){
  return new Promise((resolve, reject) => {
    thunder
      .call('org.rdk.DeviceDiagnostics', 'getAVDecoderStatus')
      .then(result => {
        resolve(result)
      })
      .catch(err => {
        console.error("AppAPI getAvCodeStatus error:", err)
        resolve(false)
      });
  })
}

SaveTimerValue(value1) {
  console.log("persistenceSt",value1)
  return new Promise((resolve, reject) => {
    thunder
      .call('org.rdk.PersistentStore', 'setValue', {
        namespace: "ScreenSaverTime",
        key: "timerValue",
        value: value1
      })
      .then(result => {
        resolve(result.success)
      })
      .catch(err => {
        console.error('AppAPI SaveTimerValue ScreenSaverTime failed:', err)
        reject()
      })
  })
}

getTimerValue() {
  return new Promise((resolve) => {
    thunder
      .call('org.rdk.PersistentStore', 'getValue', { namespace: 'ScreenSaverTime', key: 'timerValue' })
      .then(result => {
        resolve(result.value)
      })
      .catch(err => {
        resolve('')
      })
  })
}

  /**
   * Function to send voice message.
   */
  resetAVSCredentials(){
    return new Promise((resolve, reject) => {
      Storage.set("AlexaVoiceAssitantState", "AlexaAuthPending");
      thunder.Controller.activate({ callsign: 'SmartScreen' }).then(() => {
        console.log("Alexa resetAVSCredentials; activating SmartScreen instance.")
      })
      thunder.call('org.rdk.VoiceControl', 'sendVoiceMessage', {"msgPayload":{"event": "ResetAVS"}})
        .then(result => {
          resolve(result)
        }).catch(err => {
          resolve(false)
        })
    })
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
      /* Free up Smartscreen resources */
      thunder.Controller.deactivate({ callsign: 'SmartScreen' }).then(() => {
        console.log("Alexa AlexaUserDenied; deactivating SmartScreen instance.")
      })
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
  getAlexaDeviceSettings() {
    return new Promise((resolve, reject) => {
      thunder.call('org.rdk.VoiceControl', 'sendVoiceMessage', { "msgPayload": { "DeviceSettings": "Get Device Settings" } })
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          resolve(false)
        })
    })
  }
  setUILanguage(updatedLanguage) {
    return new Promise((resolve, reject) => {
      thunder.call('org.rdk.UserPreferences', 'setUILanguage',{"ui_language": updatedLanguage}).then(result => {
        resolve(result)
      }).catch(err => {
        resolve(false)
      })
    })
  }
  setLanguageinAlexa(updatedLanguage) {
    let updatedLan = []
    updatedLan.push(updatedLanguage)
    console.log("setLanguageinAlexa sending :" + updatedLan)
    return new Promise((resolve, reject) => {
      thunder.call('org.rdk.VoiceControl', 'sendVoiceMessage', { "msgPayload": { "DeviceSettings": "Set Device Settings", "values": { "locale": updatedLan } } })
        .then(result => {
          resolve(result)
        }).catch(err => {
          resolve(false)
        })
    })
  }
  setTimeZoneinAlexa(updatedTimeZone) {
    console.log("setTimeZoneinAlexa sending :" + updatedTimeZone)
    return new Promise((resolve, reject) => {
      thunder.call('org.rdk.VoiceControl', 'sendVoiceMessage', { "msgPayload": { "DeviceSettings": "Set Device Settings", "values": { "timezone": updatedTimeZone } } })
        .then(result => {
          resolve(result)
        }).catch(err => {
          resolve(false)
        })
    })
  }
}
