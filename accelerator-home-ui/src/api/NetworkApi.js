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

export default class Network {
  constructor() {
    this._events = new Map();
    const config = {
      host: '127.0.0.1',
      port: 9998,
      default: 1,
    };
    this._thunder = ThunderJS(config);
    this.callsign = 'org.rdk.Network';
    this.INFO = console.info;
    this.LOG = console.log;
    this.ERR = console.error;
  }

  /**
   * Function to activate network plugin
   */
  activate() {
    return new Promise((resolve, reject) => {
      this._thunder.call('Controller', 'activate', { callsign: this.callsign }).then(result => {
        this._thunder.on(this.callsign, 'onIPAddressStatusChanged', notification => {
          if (this._events.has('onIPAddressStatusChanged')) {
            this._events.get('onIPAddressStatusChanged')(notification);
          } else {
            this.LOG(this.callsign + "[onIPAddressStatusChanged]: " + notification);
          }
        });
        this._thunder.on(this.callsign, 'onDefaultInterfaceChanged', notification => {
          if (this._events.has('onDefaultInterfaceChanged')) {
            this._events.get('onDefaultInterfaceChanged')(notification);
          } else {
            this.LOG(this.callsign + "[onDefaultInterfaceChanged]: " + notification);
          }
        });
        this._thunder.on(this.callsign, 'onConnectionStatusChanged', notification => {
          if (this._events.has('onConnectionStatusChanged')) {
            this._events.get('onConnectionStatusChanged')(notification);
          } else {
            this.LOG(this.callsign + "[onConnectionStatusChanged]: " + notification);
          }
        });
        this._thunder.on(this.callsign, 'onInterfaceStatusChanged', notification => {
          if (this._events.has('onInterfaceStatusChanged')) {
            this._events.get('onInterfaceStatusChanged')(notification);
          } else {
            this.LOG(this.callsign + "[onInterfaceStatusChanged]: " + notification);
          }
        });
        this._thunder.on(this.callsign, 'onInternetStatusChange', notification => {
          if (this._events.has('onInternetStatusChange')) {
            this._events.get('onInternetStatusChange')(notification);
          } else {
            this.LOG(this.callsign + "[onInternetStatusChange]: " + notification);
          }
        });
        console.log('Activation success')
        resolve(true)
      });
    });
  }

  /**
   *Register events and event listeners.
   * @param {string} eventId
   * @param {function} callback
   *
   */
  registerEvent(eventId, callback) {
    this._events.set(eventId, callback);
  }

  /**
   * Function to return the IP of the default interface.
   */
  getStbIp() {
    return new Promise((resolve, reject) => {
      this._thunder.call(this.callsign, 'getStbIp').then(result => {
        this.INFO(this.callsign + "[getStbIp] result: " + JSON.stringify(result))
        if (result.success) {
          resolve(result.ip)
        }
        reject(false)
      }).catch(err => {
        this.ERR(this.callsign + "[getStbIp] error: " + err)
        reject(err)
      })
    })
  }
  /**
   * Function to return available interfaces.
   */
  getInterfaces() {
    return new Promise((resolve, reject) => {
      this._thunder.call(this.callsign, 'getInterfaces').then(result => {
        this.INFO(this.callsign + "[getInterfaces] result: " + result)
        if (result.success) {
          resolve(result.interfaces)
        }
      }).catch(err => {
        this.ERR(this.callsign + "[getInterfaces] error: " + err)
        reject(err)
      })
    })
  }

  /**
   * Function to return default interfaces.
   */
  getDefaultInterface() {
    return new Promise((resolve, reject) => {
      this._thunder.call(this.callsign, 'getDefaultInterface').then(result => {
        this.INFO(this.callsign + "[getDefaultInterface] result: " + result)
        if (result.success) {
          resolve(result.interface)
        }
      }).catch(err => {
        this.ERR(this.callsign + "[getDefaultInterface] error: " + err)
        reject(err)
      })
    })
  }

  setDefaultInterface(interfaceName = "ETHERNET", persist = true) {
    return new Promise((resolve, reject) => {
      this._thunder.call(this.callsign, 'setDefaultInterface', {"interface": interfaceName, "persist": persist}).then(result => {
        this.INFO(this.callsign + "[setDefaultInterface] result: " + result)
        resolve(result.success)
      }).catch(err => {
        this.ERR(this.callsign + "[setDefaultInterface] error: " + err)
        reject(err)
      })
    })
  }

  getSTBIPFamily(family = "AF_INET") {
    return new Promise((resolve, reject) => {
      this._thunder.call(this.callsign, 'getSTBIPFamily', {"family": family}).then(result => {
        this.INFO(this.callsign + "[getSTBIPFamily] result: " + result)
        if (result.success) { resolve(result) }
        reject(false);
      }).catch(err => {
        this.ERR(this.callsign + "[getSTBIPFamily] error: " + err)
        reject(err)
      })
    })
  }

  /**
   * Function to return IP Settings.
   */

  getIPSettings(interfaceName, ipversion = "IPv4") {
    return new Promise((resolve, reject) => {
      this._thunder.call(this.callsign, 'getIPSettings', {"interface": interfaceName, "ipversion": ipversion}).then(result => {
        this.INFO(this.callsign + "[getIPSettings] result: " + result)
        if (result.success) {
          resolve(result);
        }
        reject(false);
      }).catch(err => {
        this.ERR(this.callsign + "[getIPSettings] error: " + err)
        reject(err)
      })
    })
  }

  getNamedEndpoints() {
    return new Promise((resolve, reject) => {
      this._thunder.call(this.callsign, 'getNamedEndpoints').then(result => {
        this.INFO(this.callsign + "[getNamedEndpoints] result: " + result)
        if (result.success) resolve(result.endpoints);
        reject(false)
      }).catch(err => {
        this.ERR(this.callsign + "[getNamedEndpoints] error: " + err)
        reject(err)
      })
    })
  }

  /**
   * Function to set IP Settings.
   */

  setIPSettings(IPSettings) {
    return new Promise((resolve, reject) => {
      this._thunder.call(this.callsign, 'setIPSettings', IPSettings).then(result => {
        this.INFO(this.callsign + "[setIPSettings] result: " + result)
        resolve(result.success)
      }).catch(err => {
        this.ERR(this.callsign + "[setIPSettings] error: " + err)
        reject(err)
      })
    })
  }

  isConnectedToInternet(useWeb = true) {
    return new Promise((resolve, reject) => {
      if (useWeb) {
        let header = new Headers();
        header.append('pragma', 'no-cache');
        header.append('cache-control', 'no-cache');
        fetch("https://example.com/index.html",{method: 'GET',headers: header,}).then(res => {
          this.INFO(this.callsign + "[isConnectedToInternet] result: " + res)
          if(res.status >= 200 && res.status <= 300){
            console.log("Connected to internet");
            resolve(true)
          } else{
            console.log("No Internet Available");
            resolve(false)
          }
        }).catch(err => {
          this.ERR(this.callsign + "[isConnectedToInternet] error: Internet Check failed: No Internet Available." + err)
          resolve(false); //fail of fetch method needs to be considered as no internet
        })
      } else {
        this._thunder.call(this.callsign, 'isConnectedToInternet').then(result => {
          this.INFO(this.callsign + "[isConnectedToInternet] result: " + result)
          if (result.success) resolve(result.connectedToInternet)
          resolve(false)
        }).catch(err => {
          this.ERR(this.callsign + "[isConnectedToInternet] error: " + err)
          reject(err)
        })
      }
    })
  }

  getinternetconnectionstate() {
    return new Promise((resolve, reject) => {
      this._thunder.call(this.callsign, 'getInternetConnectionState').then(result => {
        this.INFO(this.callsign + "[getinternetconnectionstate] result: " + result)
        if (result.success) resolve(result)
        reject(false)
      }).catch(err => {
        this.ERR(this.callsign + "[getinternetconnectionstate] error: " + err)
        reject(err)
      })
    })
  }

  getCaptivePortalURI() {
    return new Promise((resolve, reject) => {
      this._thunder.call(this.callsign, 'getCaptivePortalURI').then(result => {
        this.INFO(this.callsign + "[getCaptivePortalURI] result: " + result)
        if (result.success) resolve(result)
        reject(false)
      }).catch(err => {
        this.ERR(this.callsign + "[getCaptivePortalURI] error: " + err)
        reject(err)
      })
    })
  }

  startConnectivityMonitoring(intervalInSec = 30) {
    return new Promise((resolve, reject) => {
      this._thunder.call(this.callsign, 'startConnectivityMonitoring', {"interval": intervalInSec}).then(result => {
        this.INFO(this.callsign + "[startConnectivityMonitoring] result: " + result)
        resolve(result.success)
      }).catch(err => {
        this.ERR(this.callsign + "[startConnectivityMonitoring] error: " + err)
        reject(err)
      })
    })
  }

  stopConnectivityMonitoring() {
    return new Promise((resolve, reject) => {
      this._thunder.call(this.callsign, 'stopConnectivityMonitoring').then(result => {
        this.INFO(this.callsign + "[stopConnectivityMonitoring] result: " + result)
        resolve(result.success)
      }).catch(err => {
        this.ERR(this.callsign + "[stopConnectivityMonitoring] error: " + err)
        reject(err)
      })
    })
  }

  isInterfaceEnabled(interfaceName = "WIFI") {
    return new Promise((resolve, reject) => {
      this._thunder.call(this.callsign, 'isInterfaceEnabled', {"interface": interfaceName}).then(result => {
        this.INFO(this.callsign + "[isInterfaceEnabled] result: " + result)
        if (result.success) resolve(result.enabled)
        resolve(false)
      }).catch(err => {
        this.ERR(this.callsign + "[isInterfaceEnabled] error: " + err)
        reject(err)
      })
    })
  }

  ping(endpoint = "8.8.8.8", packets = 10, guid = "2c6ff543-d929-4be4-a0d8-9abae2ca7471") {
    return new Promise((resolve, reject) => {
      this._thunder.call(this.callsign, 'ping', {"endpoint": endpoint, "packets": packets, "guid": guid}).then(result => {
        this.INFO(this.callsign + "[ping] result: " + result)
        if (result.success) resolve(result)
        resolve(false)
      }).catch(err => {
        this.ERR(this.callsign + "[ping] error: " + err)
        reject(err)
      })
    })
  }

  pingNamedEndpoint(endpointName = "CMTS", packets = 15, guid = "2c6ff543-d929-4be4-a0d8-9abae2ca7471") {
    return new Promise((resolve, reject) => {
      this._thunder.call(this.callsign, 'pingNamedEndpoint', {"endpointName": endpointName, "packets": packets, "guid": guid}).then(result => {
        this.INFO(this.callsign + "[pingNamedEndpoint] result: " + result)
        if (result.success) resolve(result)
        resolve(false)
      }).catch(err => {
        this.ERR(this.callsign + "[pingNamedEndpoint] error: " + err)
        reject(err)
      })
    })
  }

  setInterfaceEnabled(interfaceName, enabled = true, persist = true) {
    return new Promise((resolve, reject) => {
      this._thunder.call(this.callsign, 'setInterfaceEnabled', {"interface": interfaceName, "enabled": enabled, "persist": persist}).then(result => {
        this.INFO(this.callsign + "[setInterfaceEnabled] result: " + result)
        resolve(result.success)
      }).catch(err => {
        this.ERR(this.callsign + "[setInterfaceEnabled] error: " + err)
        reject(err)
      })
    })
  }

  getPublicIP(iface = "ETHERNET", ipv6 = false) {
    return new Promise((resolve, reject) => {
      this._thunder.call(this.callsign, 'getPublicIP', {"iface": iface, "ipv6": ipv6}).then(result => {
        this.INFO(this.callsign + "[getPublicIP] result: " + result)
        if (result.success) resolve(result.public_ip)
        resolve(false)
      }).catch(err => {
        this.ERR(this.callsign + "[getPublicIP] error: " + err)
        reject(err)
      })
    })
  }

  setStunEndPoint(server = "global.stun.twilio.com", port = 3478, sync = true, timeout = 30, cache_timeout = 0) {
    return new Promise((resolve, reject) => {
      this._thunder.call(this.callsign, 'setStunEndPoint', {
        "server": server,
        "port": port,
        "sync": sync,
        "timeout": timeout,
        "cache_timeout": cache_timeout
      }).then(result => {
        this.INFO(this.callsign + "[setStunEndPoint] result: " + result)
        resolve(result.success)
      }).catch(err => {
        this.ERR(this.callsign + "[setStunEndPoint] error: " + err)
        reject(err)
      })
    })
  }

  configurePNI(disableConnectivityTest = true) {
    return new Promise((resolve, reject) => {
      this._thunder.call(this.callsign, 'configurePNI', {"disableConnectivityTest": disableConnectivityTest}).then(result => {
        this.INFO(this.callsign + "[configurePNI] result: " + result)
        resolve(result.success)
      }).catch(err => {
        this.ERR(this.callsign + "[configurePNI] error: " + err)
        reject(err)
      })
    })
  }

  trace(endpoint = "8.8.8.8", packets = 15) {
    return new Promise((resolve, reject) => {
      this._thunder.call(this.callsign, 'trace', {"disableConnectivityTest": disableConnectivityTest}).then(result => {
        this.INFO(this.callsign + "[trace] result: " + result)
        if (result.success) resolve(result)
        reject(false)
      }).catch(err => {
        this.ERR(this.callsign + "[trace] error: " + err)
        reject(err)
      })
    })
  }

  traceNamedEndpoint(endpointName = "CMTS", packets = 15) {
    return new Promise((resolve, reject) => {
      this._thunder.call(this.callsign, 'trace', {"endpointName": endpointName, "packets": packets}).then(result => {
        this.INFO(this.callsign + "[traceNamedEndpoint] result: " + result)
        if (result.success) resolve(result)
        reject(false)
      }).catch(err => {
        this.ERR(this.callsign + "[traceNamedEndpoint] error: " + err)
        reject(err)
      })
    })
  }
}
