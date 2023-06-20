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

import ThunderJS from 'ThunderJS'
import HomeApi from './HomeApi';
import { Storage } from "@lightningjs/sdk";

let platform = null

let thunder = null
function thunderJS() {
  if (thunder)
    return thunder

  thunder = ThunderJS({
    host: window.location.hostname,
    port: '9998'
  })
  return thunder
}

async function registerListener(plugin, eventname, cb) {
  return await thunderJS().on(plugin, eventname, (notification) => {
    console.log("DACApi Received event " + plugin + ":" + eventname, notification)
    if (cb != null) {
      cb(notification, eventname, plugin)
    }
  })
}

async function addEventHandler(eventHandlers, pluginname, eventname, cb) {
  eventHandlers.push(await registerListener(pluginname, eventname, cb))
}

function translateLisaProgressEvent(evtname) {
  if (evtname === "DOWNLOADING") {
    return "Downloading"
  } else if (evtname === "UNTARING") {
    return "Extracting"
  } else if (evtname === "UPDATING_DATABASE") {
    return "Installing"
  } else if (evtname === "FINISHED") {
    return "Finished"
  } else {
    return evtname
  }
}

async function registerLISAEvents(id, progress) {
  let eventHandlers = []
  if(progress === undefined)
  {
    console.log("DACApi progress undefined, return")
	  return
  }
  progress.reset()

  let handleProgress = (notification, eventname, plugin) => {
    console.log('DACApi handleProgress: ' + plugin + ' ' + eventname)
    if (plugin !== 'LISA') {
      return
    }
    if (notification.status === 'Progress') {
      let parts = notification.details.split(" ")
      if (parts.length >= 2) {
        let pc = parseFloat(parts[1]) / 100.0
        progress.setProgress(pc, translateLisaProgressEvent(parts[0]))
      }
    } else if (notification.status === 'Success') {
      progress.fireAncestors('$fireDACOperationFinished', true)
      eventHandlers.map(h => { h.dispose() })
      eventHandlers = []
    } else if (notification.status === 'Failed') {
      progress.fireAncestors('$fireDACOperationFinished', false, 'Failed')
      eventHandlers.map(h => { h.dispose() })
      eventHandlers = []
    }
  }
  addEventHandler( eventHandlers, 'LISA', 'operationStatus', handleProgress);
}

export const installDACApp = async (app , progress) => {
  let platName = await getPlatformNameForDAC()
  const url = app.url.replace(/amlogic/g, platName)
  registerLISAEvents(app.id, progress)

  let result = null
  try {
    result = await thunderJS()['LISA'].install({
      id: app.id,
      type: 'application/dac.native',
      appName: app.name,
      category: app.category,
      versionAsParameter: app.version,
      url: url
    })
  } catch (error) {
    console.error('DACApi Error on installDACApp: ' + error.code + ' ' + error.message)
    return false
  }
  return true
}

export const uninstallDACApp = async (app, progress) => {
  // Could be same app is running; lets end it if so.
  await thunderJS()['org.rdk.RDKShell'].getClients().then(response => {
    if (Array.isArray(response.clients) && response.clients.includes(app.id.toLowerCase())) {
      console.log("DACApi killing " +app.id+ " as we got a match in getClients response.");
      thunderJS()['org.rdk.RDKShell'].kill({ client: app.id })
    }
  })

  registerLISAEvents(app.id, progress)

  let result = null
  try {
    result = await thunderJS()['LISA'].uninstall({
      id: app.id,
      type: 'application/dac.native',
      versionAsParameter: app.version,
      uninstallType: 'full'
    })
  } catch (error) {
    console.error('DACApi Error on LISA uninstall: ' + error.code + ' ' + error.message)
    return false
  }
  return true
}

export const isInstalledDACApp = async (app) => {
  let result = null
  try {
    result = await thunderJS()['LISA'].getStorageDetails({
      id: app.id,
      type: 'application/dac.native',
      versionAsParameter: app.version,
    })
  } catch (error) {
    console.error('DACApi Error on LISA getStorageDetails: ', error)
    return false
  }

  return result == null ? false : result.apps.path !== ''
}

export const getInstalledDACApps = async () => {
  let result = null
  try {
    result = await thunderJS()['LISA'].getList()
  } catch (error) {
    console.error('DACApi Error on LISA getList: ', error)
  }

  return result == null ? [] : (result.apps ? result.apps : [])
}

export const getPlatformNameForDAC = async () => {
  if (platform == null) {
    platform = await getDeviceName()
    platform = platform.split('-')[0]
  }

  if (platform === 'raspberrypi') {
    return 'broadcom'
  } else if (platform === 'brcm972180hbc') {
    return '7218c'
  } else if (platform === 'brcm972127ott') {
    return '72127ott'
  } else if (platform === 'vip7802') {
    return '7218c'
  } else if (platform.toLowerCase().includes('hp44h')) {
    return 'amlogic'
  } else if (platform.toLowerCase().includes('amlogic')) {
    return 'amlogic'
  } else if (platform.toLowerCase().includes('mediabox')) {
    return 'realtek'
  } else {
    // default
    return '7218c'
  }
}

export const getDeviceName = async () => {
  let result = null
  try {
    result = await thunderJS().DeviceInfo.systeminfo()
  } catch (error) {
    console.error('DAC Api Error on systeminfo: ', error)
  }
  return result == null ? "unknown" : result.devicename
}

export const startDACApp = async (app) => {
  console.log('DACApi startDACApp invoked with data:' + app)
  let result = null
  try {
    if (app.type === 'application/dac.native') {
      result = await thunderJS()['org.rdk.RDKShell'].launchApplication({
        client: app.id,
        mimeType: app.type,
        uri: app.id + ';' + app.version + ';' + app.type,
        topmost: true,
        focus: true
      })
    } else if (app.type === 'application/html') {
      result = await thunderJS()['org.rdk.RDKShell'].launch({ callsign: app.id, uri: app.url, type: 'HtmlApp' })
    } else if (app.type === 'application/lightning') {
      result = await thunderJS()['org.rdk.RDKShell'].launch({ callsign: app.id, uri: app.url, type: 'LightningApp' })
    } else {
      console.warn('DACApi Unsupported app type: ' + app.type)
      return false
    }
  } catch (error) {
    console.error('DACApi Error on launchApplication: ', error)
    return false
  }

  if (result == null) {
    console.error('DACApi launch error returned result: ', result)
    return false
  } else if (!result.success) {
    // Could be same app is in suspended mode.
    await thunderJS()['org.rdk.RDKShell'].getClients().then(response => {
      if (Array.isArray(response.clients) && response.clients.includes(app.id.toLowerCase())) {
        console.log("DACApi " +app.id+ " got a match in getClients response; could be in suspended mode, resume it.");
        thunderJS()['org.rdk.RDKShell'].resumeApplication({ client: app.id }).then(result => {
          if (!result.success) return false;
        })
      }
    })
  } else {
    // Nothing to do here.
  }

  try {
    result = await thunderJS()['org.rdk.RDKShell'].moveToFront({ client: app.id})
  } catch (error) {
    console.log('DACApi Error on moveToFront: ', error)
  }

  try {
    result = await thunderJS()['org.rdk.RDKShell'].setFocus({ client: app.id})
    Storage.set("applicationType", (app.id+';'+app.version +';'+app.type));
  } catch (error) {
    console.log('DACApi Error on setFocus: ', error)
    return false
  }
  return result == null ? false : result.success
}

/* WorkAround until proper cloud based App Catalog support */
export const getAppCatalogInfo = async () => {
  let appListArray = null
  try {
    let data = new HomeApi().getPartnerAppsInfo();
    if (data) {
      data = await JSON.parse(data);
      if (data != null && data.hasOwnProperty("app-catalog-path")) {
        let url = data["app-catalog-path"]
        await fetch(url, {method: 'GET', cache: "no-store"})
        .then(response => response.text())
        .then(result => {
          result = JSON.parse(result)
          console.log("DACApi fetch result: ", result)
          if (result.hasOwnProperty("AppCatalogInfo")) {
            appListArray = result["AppCatalogInfo"];
          } else {
            console.error("DACApi result does not have AppCatalogInfo")
          }
      })
        .catch(error => console.log("DACApi fetch error", error));
      }
    } else {
      console.error("DACApi Appstore info not available; DAC features won't work.")
    }
  } catch (error) {
    console.log("DACApi Appstore info Error: ", error)
  }
  return appListArray == null ? undefined : appListArray;
}
