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

import { Lightning, Registry, Router, Utils, Language } from '@lightningjs/sdk'
import { CONFIG } from '../../Config/Config'
import AppApi from '../../api/AppApi';
import BluetoothApi from '../../api/BluetoothApi';
import ThunderJS from 'ThunderJS'

var appApi = new AppApi();
var bluetoothApi = new BluetoothApi();
const config = {
    host: '127.0.0.1',
    port: 9998,
    default: 1,
}
const _thunder = ThunderJS(config)

export default class BluetoothScreen extends Lightning.Component {
    static _template() {
        return {
            w: 1920,
            h: 1080,
            rect: true,
            color: 0xff000000,
            Bluetooth: {
                x: 960,
                y: 270,
                Title: {
                    x: 0,
                    y: 0,
                    mountX: 0.5,
                    text: {
                        text: "Pairing Your Remote",
                        fontFace: CONFIG.language.font,
                        fontSize: 40,
                        textColor: CONFIG.theme.hex,
                        fontStyle: 'bold'
                    },
                },
                BorderTop: {
                    x: 0, y: 75, w: 1558, h: 3, rect: true, mountX: 0.5,
                },
                Info: {
                    x: 0,
                    y: 135,
                    mountX: 0.5,
                    text: {
                        text: "Please put the remote in pairing mode, scanning will start in a moment.",
                        fontFace: CONFIG.language.font,
                        fontSize: 25,
                    },
                    visible: true
                },
                Timer: {
                    x: 0,
                    y: 200,
                    mountX: 0.5,
                    text: {
                        text: "0:30",
                        fontFace: CONFIG.language.font,
                        fontSize: 80,
                    },
                    visible: true
                },
                Loader: {
                    x: 0,
                    y: 200,
                    mountX: 0.5,
                    w: 110,
                    h: 110,
                    zIndex: 2,
                    src: Utils.asset("images/settings/Loading.png"),
                    visible: false
                },
                Buttons: {
                    Continue: {
                        x: 0, y: 210, w: 300, mountX: 0.5, h: 60, rect: true, color: 0xFFFFFFFF,
                        Title: {
                            x: 150,
                            y: 30,
                            mount: 0.5,
                            text: {
                                text: "Continue Setup",
                                fontFace: CONFIG.language.font,
                                fontSize: 22,
                                textColor: 0xFF000000,
                                fontStyle: 'bold'
                            },
                        },
                        visible: false
                    },
                    StartPairing: {
                        x: 0, y: 410, w: 300, mountX: 0.5, h: 60, rect: true, color: 0xFFFFFFFF,
                        Title: {
                            x: 150,
                            y: 30,
                            mount: 0.5,
                            text: {
                                text: "SKIP",
                                fontFace: CONFIG.language.font,
                                fontSize: 22,
                                textColor: 0xFF000000,
                                fontStyle: 'bold'
                            },
                        },
                        visible: true,
                        alpha: 0.5
                    },
                },
                BorderBottom: {
                    x: 0, y: 350, w: 1558, h: 3, rect: true, mountX: 0.5,
                },
            }
        }
    }

    _PairingApis() {
        //bluetoothApi.btactivate().then(enableResult =>{
        //  console.log('1')
        bluetoothApi.enable().then(res => {
            console.log("SplashBluetoothScreen enable result: ", res)
            bluetoothApi.startScanBluetooth().then(startScanresult => {
                console.log('SplashBluetoothScreen startScanresult ', startScanresult)
                var SubscribeEvent = _thunder.on('org.rdk.Bluetooth', 'onDiscoveredDevice', notification => {
                    bluetoothApi.getDiscoveredDevices().then((getdocoveredInfo) => {
                        console.log('SplashBluetoothScreen onDiscoveredDevice ', getdocoveredInfo[0].name)
                        this.tag('Info').text.text = `pairing this device ${getdocoveredInfo[0].name}`
                        //bluetoothApi.connect(getdocoveredInfo[0].deviceID, getdocoveredInfo[0].deviceType).then(connectresult=>{
                        //  console.log("connectresult",connectresult)
                        bluetoothApi.pair(getdocoveredInfo[0].deviceID).then(Pairresult => {
                            console.log("SplashBluetoothScreen Pairresult", Pairresult)
                            bluetoothApi.getConnectedDevices().then(getCdresult => {
                                console.log("SplashBluetoothScreen getConnectedDevices", getCdresult)
                                bluetoothApi.getPairedDevices().then(getpairedDevices => {
                                    console.log("SplashBluetoothScreen getpairedDevices", getpairedDevices)
                                    bluetoothApi.stopScan().then(stopScan => {
                                        console.log("SplashBluetoothScreen stopscan", stopScan)
                                        SubscribeEvent.dispose();
                                        //bluetoothApi.disable().then(disable =>{
                                        //console.log("disable")
                                        bluetoothApi.deactivateBluetooth().then(deactivateBluetooth => {
                                            console.log("SplashBluetoothScreen DeactivatedBluetooth", deactivateBluetooth)
                                            Router.navigate('splash/language')
                                        })

                                    })
                                    .catch(err => {
                                        console.error(`SplashBluetoothScreen cant stopscan device : ${JSON.stringify(err)}`)
                                    })
                                })
                                .catch(err => {
                                    console.error(`SplashBluetoothScreen cant getpaired device : ${JSON.stringify(err)}`)
                                })
                            })
                            .catch(err => {
                                console.error(`SplashBluetoothScreen Can't getconnected device : ${JSON.stringify(err)}`)
                            })
                        })
                        .catch(err => {
                            console.error(`SplashBluetoothScreen Can't pair device : ${JSON.stringify(err)}`)
                        })
                    })
                })
            })
            .catch(err => {
                console.error(`Can't scan enable : ${JSON.stringify(err)}`)
            })
        })
    }

    async rcPairingApis() {
        _thunder.on('org.rdk.RemoteControl', 'onStatus', notification => {
            console.log("SplashBluetoothScreen async RemoteControl onStatus ", JSON.stringify(notification))
            var rcuNotConnectedStartPairing = 1;
            if (notification.status.remoteData != []) { // result.status.pairingState === "IDLE/SEARCHING/COMPLETED")
                notification.status.remoteData.map(item =>{
                    if(item.connected === true){
                        this.tag('Info').text.text = `paired this device ${item.name}`
                        Registry.setTimeout(() => {
                            if(Router.getActiveHash() === "splash/bluetooth"){
                                Router.navigate('splash/language')
                            }
                        }, 2000)
                        rcuNotConnectedStartPairing = 0;
                    }
                })
            }
            console.log("SplashBluetoothScreen async RemoteControl checking condition to kick start pairing")
            if ((notification.status.remoteData === [] || rcuNotConnectedStartPairing) && (notification.status.pairingState != "SEARCHING")) {
                appApi.activateAutoPairing()
            }
        })
        var RCInterval = Registry.setInterval(()=>{
            bluetoothApi.getNetStatus().then(result => {
                if (result.success) {
                    var rcuNotConnectedStartPairing = 1;
                    console.log("SplashBluetoothScreen async RCInterval RemoteControl getNetStatus ", JSON.stringify(result))
                    if (result.status.remoteData != []) {
                        result.status.remoteData.map(item =>{
                            if(item.connected === true){
                                console.log("SplashBluetoothScreen async RCInterval got connected RCU hence clearing ", RCInterval)
                                Registry.clearInterval(RCInterval)
                                rcuNotConnectedStartPairing = 0;
                            }
                        })
                    }
                    if ((result.status.remoteData === [] && (result.status.pairingState != "SEARCHING")) || rcuNotConnectedStartPairing) {//|| result.status.pairingState === "SEARCHING" ){
                        console.log("SplashBluetoothScreen async RCInterval RemoteControl getNetStatus activateAutoPairing 4")
                        appApi.activateAutoPairing().then(status => {
                            console.log("Invoked activateAutoPairing() and got ", status)
                            Registry.clearInterval(RCInterval) // org.rdk.RemoteControl 'onStatus' notification will do the rest.
                        })
                    }
                }
            })
        }, 30000, true);
    }

    _init() {
        appApi.getPluginStatus('org.rdk.RemoteControl')
            .then(result => {
                if (result[0].state != "activated") {
                    bluetoothApi.remotepluginactivate()
                    _thunder.on('Controller', 'statechange', notification => {
                        console.log("SplashBluetoothScreen init RemoteControlController statechange Notification : " + JSON.stringify(notification))
                        if (notification.state === "Activated") {
                            console.log("SplashBluetoothScreen init rcPairingApis")
                            this.rcPairingApis();
                        }
                    })
                }
                else {
                    console.log("SplashBluetoothScreen init RemoteControl already activated")
                    this.rcPairingApis();
                }
            })
            .catch(err => {
                console.log('SplashBluetoothScreen init remote autoPair plugin error:', JSON.stringify(err))
                appApi.getPluginStatusParams('org.rdk.Bluetooth').then(pluginresult => {
                    console.log("SplashBluetoothScreen init status", pluginresult[1])
                    if (pluginresult[1] === 'deactivated') {
                        bluetoothApi.btactivate().then(result => {
                            console.log("SplashBluetoothScreen init pairing bluetooth")
                            this._PairingApis()
                        })
                    }
                    else {
                        console.log("SplashBluetoothScreen init status not deactivated")
                        this._PairingApis()
                    }
                })
            })
    }

    _focus() {
        this.initTimer()
    }

    pageTransition() {
        return 'left'
    }

    _unfocus() {
        if (this.timeInterval) {
            Registry.clearInterval(this.timeInterval)
        }
        //this.tag('Timer').text.text = '0:10'
    }

    getTimeRemaining(endtime) {
        const total = Date.parse(endtime) - Date.parse(new Date())
        const seconds = Math.floor((total / 1000) % 60)
        return { total, seconds }
    }

    initTimer() {
        const endTime = new Date(Date.parse(new Date()) + 30000)
        const timerText = this.tag('Timer')
        this.timeInterval = Registry.setInterval(() => {
            const time = this.getTimeRemaining(endTime)
            timerText.text.text = time.seconds >= 10 ?`0:${time.seconds}`:`0:0${time.seconds}`
            if (time.total <= 0) {
                Registry.clearInterval(this.timeInterval)
                this._setState('StartPairing')
                //Router.navigate('splash/language')
            }
        }, 1000)
    }

    static _states() {
        return [
            class RemotePair extends this{
                $enter() {
                    this.tag('Timer').visible = true
                    this.tag('Info').text.text = 'Please put the remote in pairing mode, scanning will start in a moment.'
                }
                _handleRight() {
                    this._setState('Scanning')
                }
                $exit() {
                    this.tag('Timer').visible = false
                    this.tag('Info').text.text = ''
                }
            },
            class Scanning extends this{
                $enter() {
                    this.tag('Loader').visible = true
                    this.tag('Info').text.text = 'Scanning'
                }
                _handleRight() {
                    this._setState('PairComplete')
                }
                _handleLeft() {
                    this._setState('RemotePair')
                }
                $exit() {
                    this.tag('Loader').visible = false
                    this.tag('Info').text.text = ''
                }
            },
            class PairComplete extends this{
                $enter() {
                    this.tag('Buttons.Continue').visible = true
                    this.tag('Info').text.text = 'Pairing complete'
                }
                _handleLeft() {
                    this._setState('Scanning')
                }
                _handleRight() {
                    Router.navigate('splash/language')
                }
                $exit() {
                    this.tag('Buttons.Continue').visible = false
                    this.tag('Info').text.text = ''
                }
            },
            class StartPairing extends this{
                $enter() {
                    this.tag('Buttons.StartPairing').alpha = 1
                    this._focus()
                }
                _focus(){
                    this.tag('Buttons.StartPairing').patch({
                        color: CONFIG.theme.hex
                    })
                    this.tag('Buttons.StartPairing.Title').patch({
                        text: {
                            textColor: 0xFFFFFFFF
                        }
                    })
                }
                _handleLeft() {

                }
                _handleRight() {

                }
                _handleEnter() {
                    console.log('SplashBluetoothScreen states Start Pairing')
                    Router.navigate('splash/language')
                    //this.rcPairingApis();
                }
                $exit() {
                    this.tag('Buttons.StartPairing').alpha = 0.5
                }
            }
        ]
    }
}
