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
import { Lightning, Language, Router } from '@lightningjs/sdk'
import { COLORS } from './../colors/Colors'
import { CONFIG } from '../Config/Config'
import AppApi from '../api/AppApi.js';
import BluetoothApi from '../api/BluetoothApi'
import ThunderJS from 'ThunderJS'

/**
 * Class for Video and Audio screen.
 */

var appApi = new AppApi();
var bluetoothApi = new BluetoothApi();
const config = {
    host: '127.0.0.1',
    port: 9998,
    default: 1,
}
const _thunder = ThunderJS(config)


export default class RCInformationScreen extends Lightning.Component {

    _onChanged() {
        this.widgets.menu.updateTopPanelText(Language.translate('Settings  Bluetooth Voice Remote Control'));
    }

    pageTransition() {
        return 'left'
    }


    static _template() {
        return {
            rect: true,
            h: 1080,
            w: 1920,
            color: 0xCC000000,
            DeviceInfoContents: {
                x: 200,
                y: 275,
                Line1: {
                    y: 0,
                    mountY: 0.5,
                    w: 1600,
                    h: 3,
                    rect: true,
                    color: 0xFFFFFFFF
                },
                MacAddress: {
                    Title: {
                        x: 10,
                        y: 45,
                        mountY: 0.5,
                        text: {
                            text: Language.translate(`MacAddress`),
                            textColor: COLORS.titleColor,
                            fontFace: CONFIG.language.font,
                            fontSize: 25,
                        }
                    },
                    Value: {
                        x: 400,
                        y: 45,
                        mountY: 0.5,
                        text: {
                            text: `N/A`,
                            textColor: COLORS.titleColor,
                            fontFace: CONFIG.language.font,
                            fontSize: 25,
                        }
                    }
                },
                Line2: {
                    y: 90,
                    mountY: 0.5,
                    w: 1600,
                    h: 3,
                    rect: true,
                    color: 0xFFFFFFFF
                },
                RCUName: {
                    Title: {
                        x: 10,
                        y: 135,
                        mountY: 0.5,
                        text: {
                            text: Language.translate(`RCU Name`),
                            textColor: COLORS.titleColor,
                            fontFace: CONFIG.language.font,
                            fontSize: 25,
                        }
                    },
                    Value: {
                        x: 400,
                        y: 135,
                        mountY: 0.5,
                        text: {
                            text: `N/A`,
                            textColor: COLORS.titleColor,
                            fontFace: CONFIG.language.font,
                            fontSize: 25,
                        }
                    },
                },
                Line3: {
                    y: 180,
                    mountY: 0.5,
                    w: 1600,
                    h: 3,
                    rect: true,
                    color: 0xFFFFFFFF
                },
                Status: {
                    Title: {
                        x: 10,
                        y: 225,
                        mountY: 0.5,
                        text: {
                            text: Language.translate(`Connection Status`),
                            textColor: COLORS.titleColor,
                            fontFace: CONFIG.language.font,
                            fontSize: 25,
                        }
                    },
                    Value: {
                        x: 400,
                        y: 225,
                        mountY: 0.5,
                        text: {
                            text: `N/A`,
                            textColor: COLORS.titleColor,
                            fontFace: CONFIG.language.font,
                            fontSize: 25,
                        }
                    },
                },
                Line4: {
                    y: 270,
                    mountY: 0.5,
                    w: 1600,
                    h: 3,
                    rect: true,
                    color: 0xFFFFFFFF
                },
                BatteryPercent: {
                    Title: {
                        x: 10,
                        y: 315,
                        mountY: 0.5,
                        text: {
                            text: Language.translate(` Battery percent`),
                            textColor: COLORS.titleColor,
                            fontFace: CONFIG.language.font,
                            wordWrapWidth: 1600,
                            wordWrap: true,
                            fontSize: 25,
                        }
                    },
                    Value: {
                        x: 400,
                        y: 315,
                        mountY: 0.5,
                        text: {
                            text: `N/A`,
                            textColor: COLORS.titleColor,
                            fontFace: CONFIG.language.font,
                            wordWrapWidth: 1200,
                            wordWrap: true,
                            fontSize: 25,
                        }
                    },
                },
                Line5: {
                    y: 360,
                    mountY: 0.5,
                    w: 1600,
                    h: 3,
                    rect: true,
                    color: 0xFFFFFFFF
                },
                SwVersion: {
                    Title: {
                        x: 10,
                        y: 405,
                        mountY: 0.5,
                        text: {
                            text: Language.translate(`Software Version`),
                            textColor: COLORS.titleColor,
                            fontFace: CONFIG.language.font,
                            fontSize: 25,
                        }
                    },
                    Value: {
                        x: 400,
                        y: 405,
                        mountY: 0.5,
                        text: {
                            text: `N/A`,
                            textColor: COLORS.titleColor,
                            fontFace: CONFIG.language.font,
                            fontSize: 25,
                        }
                    },
                },
                Line6: {
                    y: 450,
                    mountY: 0.5,
                    w: 1600,
                    h: 3,
                    rect: true,
                    color: 0xFFFFFFFF
                },
            },
        }
    }
 
    _focus(){
        this._setState("RCInformationScreen")
        appApi.getPluginStatus('org.rdk.RemoteControl')
        .then(result => {
            if(result[0].state != "activated"){
                bluetoothApi.remotepluginactivate() 
                _thunder.on('Controller', 'statechange', notification => {
                    console.log("RCInformationScreen _focus Controller statechange Notification : " + JSON.stringify(notification))
                    if(notification.state === "Activated"){
                        this.rcPairingApis();
                    }
                })
            }
           else{ this.rcPairingApis(); }
        })
    }
        
    async rcPairingApis(){
        console.log("RCInformationScreen activating RemoteControl plugin")
        await _thunder.on('org.rdk.RemoteControl', 'onStatus', notification => {
                console.log("RCInformationScreen rcPairingApis Controller ONSTATUS change RC",notification)
				let triggerPairing = 0;
                if ((notification.status.remoteData != [])) {
                    console.log("RCInformationScreen rcPairingApis RemoteData Length", notification.status.remoteData.length)
                    let RemoteName = []; let connectedStatus =[]; let MacAddress =[];
                    let swVersion=[] ;let BatteryPercent =[];

                    notification.status.remoteData.map(item=>{
						RemoteName.push(item.name)
                    })
                    notification.status.remoteData.map(item=>{
						MacAddress.push(item.macAddress)
                    })
					notification.status.remoteData.map(item=>{
						swVersion.push(item.swVersion)
					})
                    notification.status.remoteData.map(item=>{
						BatteryPercent.push(item.batteryPercent)
                    })
                    notification.status.remoteData.map(item=>{
						connectedStatus.push(item.connected)
                        if (item.connected === "true" && !triggerPairing) {
							triggerPairing++ 
                        }
                    })
                    this.tag("Status.Value").text.text = connectedStatus
                    this.tag("MacAddress.Value").text.text = MacAddress
                    this.tag("SwVersion.Value").text.text = swVersion
                    this.tag("BatteryPercent.Value").text.text = BatteryPercent
					this.tag("RCUName.Value").text.text = RemoteName
                }
                else {
					console.log("RCInformationScreen rcPairingApis remoteData empty")
					triggerPairing = ((notification.status.pairingState === "SEARCHING")?0:1);
                }
                if (triggerPairing) {
					appApi.activateAutoPairing().then(res=>{console.log("RCInformationScreen rcPairingApis startpairing 1", res)})
                }
            })

        await bluetoothApi.getNetStatus().then(result =>{
            let triggerPairing = 0;
            if (result.status.remoteData === [] && result.status.pairingState != "SEARCHING"){
                appApi.activateAutoPairing().then(res=>{console.log("RCInformationScreen rcPairingApis startpairing 2", res)})
            }
            else  if(result.status.remoteData != [] ){
                console.log("RCInformationScreen getNetStatus RemoteData Length",result.status.remoteData.length)
                let RemoteName = []; let connectedStatus =[]; let MacAddress =[];
                let swVersion=[] ;let BatteryPercent =[];

                result.status.remoteData.map(item=>{
                    RemoteName.push(item.name)
                })
                result.status.remoteData.map(item=>{
                    MacAddress.push(item.macAddress)
                })
                result.status.remoteData.map(item=>{
                    swVersion.push(item.swVersion)
                })
                result.status.remoteData.map(item=>{
                    BatteryPercent.push(item.batteryPercent)
                })
                result.status.remoteData.map(item=>{
                    connectedStatus.push(item.connected)
                    if (item.connected === "true" && !triggerPairing) {
                        triggerPairing++ 
                    }
                })
                this.tag("Status.Value").text.text = connectedStatus
                this.tag("MacAddress.Value").text.text = MacAddress
                this.tag("SwVersion.Value").text.text = swVersion
                this.tag("BatteryPercent.Value").text.text = BatteryPercent
                this.tag("RCUName.Value").text.text = RemoteName
            }
            if (triggerPairing) {
                appApi.activateAutoPairing().then(res=>{console.log("RCInformationScreen rcPairingApis startpairing 3", res)})
            }
        })
    }

    _handleBack() {
        if(!Router.isNavigating()){
        Router.navigate('settings')
        }
    }

    _handleDown() {
        if (this.tag("DeviceInfoContents").y > 215) {
            this.tag("DeviceInfoContents").y -= 20;
        }
    }
    _handleUp() {
        if (this.tag("DeviceInfoContents").y < 275) {
            this.tag("DeviceInfoContents").y += 20;
        }
    }
}
