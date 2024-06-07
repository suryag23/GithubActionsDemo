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
import { Lightning, Language, Router, Settings } from '@lightningjs/sdk'
import { COLORS } from '../../colors/Colors'
import { CONFIG } from '../../Config/Config'
import AppApi from '../../api/AppApi';
import ThunderJS from 'ThunderJS';
import { Metrics } from '@firebolt-js/sdk';

/**
 * Class for Firmware screen.
 */

const thunder = ThunderJS(CONFIG.thunderConfig)

export default class FirmwareScreen extends Lightning.Component {
    _onChanged() {
        this.widgets.menu.updateTopPanelText(Language.translate('Settings  Other Settings  Advanced Settings  Device  Firmware Update'));
    }

    pageTransition() {
        return 'left'
    }

    static _template() {
        return {
            rect: true,
            color: 0xCC000000,
            w: 1920,
            h: 1080,
            FirmwareContents: {
                x: 200,
                y: 270,
                State: {
                    Title: {
                        x: 10,
                        y: 45,
                        mountY: 0.5,
                        text: {
                            text: Language.translate('Firmware State: '),
                            textColor: COLORS.titleColor,
                            fontFace: CONFIG.language.font,
                            fontSize: 22,
                        }
                    },
                },
                Version: {
                    Title: {
                        x: 10,
                        y: 90,
                        mountY: 0.5,
                        text: {
                            text: Language.translate('Firmware Versions: '),
                            textColor: COLORS.titleColor,
                            fontFace: CONFIG.language.font,
                            fontSize: 22,
                        }
                    },
                },
                DownloadedVersion: {
                    Title: {
                        x: 10,
                        y: 135,
                        mountY: 0.5,
                        text: {
                            text: Language.translate(`Downloaded Firmware Version: `),
                            textColor: COLORS.titleColor,
                            fontFace: CONFIG.language.font,
                            fontSize: 22,
                        }
                    },
                },
                DownloadedPercent: {
                    Title: {
                        x: 10,
                        y: 180,
                        mountY: 0.5,
                        text: {
                            text: "",
                            textColor: COLORS.titleColor,
                            fontFace: CONFIG.language.font,
                            fontSize: 22,
                        }
                    },
                },
                FirmwareUpdate: {
                    RectangleDefault: {
                        x: 110, y: 200, w: 300, mountX: 0.5, h: 50, rect: true, color: CONFIG.theme.hex,
                        Update: {
                            x: 170,
                            y: 25,
                            mount: 0.5,
                            text: {
                                text: Language.translate("Check for Update"),
                                fontFace: CONFIG.language.font,
                                fontSize: 24,
                            },
                        }
                    },
                },
            },
        }
    }

    _firstEnable() {
        let state = ['Uninitialized', 'Requesting', 'Downloading', 'Failed', 'DownLoad Complete', 'Validation Complete', 'Preparing to Reboot']

        thunder.Controller.activate({ callsign: "org.rdk.System" })
            .then(res => {
                thunder.on(callsign, "onFirmwareUpdateStateChange", notification => {
                    console.log(`Tanjirou's notification : on Firmware update state changed notifcation = ${JSON.stringify(notification)}`);

                    if (state[notification.firmwareUpdateStateChange] == "Downloading") {
                        this.downloadInterval = setInterval(() => {
                            console.log(`Downloading...`);
                            this.getDownloadPercent();
                        }, 1000)
                    } else if (state[notification.firmwareUpdateStateChange] != "Downloading" && this.downloadInterval) {
                        clearInterval(this.downloadInterval);
                        this.downloadInterval = null
                    }
                }, err => {
                    Metrics.error(Metrics.ErrorType.OTHER,"pluginError", "Thunder Error while fetching onFirmwareUpdateStateChange Notification " +JSON.stringify(err), false, null)
                    console.error(`error while fetching notification ie. ${err}`)
                })
            })
            .catch(err => { 
                console.error(`error while activating the system plugin`)
                Metrics.error(Metrics.ErrorType.OTHER,"pluginError", "Thunder Controller.activate System Error" +JSON.stringify(err), false, null)
            })
    }

    _unfocus() {
        if (this.downloadInterval) {
            clearInterval(this.downloadInterval);
            this.downloadInterval = null
        }
    }

    _active() {
        let state = ['Uninitialized', 'Requesting', 'Downloading', 'Failed', 'DownLoad Complete', 'Validation Complete', 'Preparing to Reboot']
        this.onFirmwareUpdateStateChangeCB = thunder.on('org.rdk.System', 'onFirmwareUpdateStateChange', notification => {
            this.tag('State.Title').text.text = Language.translate("Firmware State: ") + state[notification.firmwareUpdateStateChange]
            console.log('onFirmwareUpdateStateChange:' + JSON.stringify(notification));
            if (state[notification.firmwareUpdateStateChange] === "Downloading") {
                this.downloadInterval = setInterval(() => {
                    console.log(`Downloading...`);
                    this.getDownloadPercent();
                }, 1000)
            } else if (state[notification.firmwareUpdateStateChange] != "Downloading") {
                this.tag('DownloadedPercent.Title').visible = false;
                if (this.downloadInterval) {
                    console.log("");
                    clearInterval(this.downloadInterval);
                    this.downloadInterval = null
                }
            }
        });
        // TODO: This need to be in _init() as it should be system wide.
        this.onFirmwareUpdateInfoReceivedCB = thunder.on('org.rdk.System', 'onFirmwareUpdateInfoReceived', params => {
            if (params.success) {
                console.log("onFirmwareUpdateInfoReceived: ", JSON.stringify(params));
                if (params.updateAvailable) {
                    switch(params.updateAvailableEnum) {
                        case 0: // A new firmware version is available.
                            break;
                        case 1: // The firmware version is at the current version.
                            break;
                        case 2: // XCONF did not return a firmware version (timeout or other XCONF error).
                            break;
                        case 3: // The device is configured not to update the firmware (swupdate.conf exists on the device).
                            break;
                    }
                }
            }
        });
        // TODO: decouple updateFirmware from here.
        //this.getDownloadFirmwareInfo();
        this.getDownloadPercent();
    }

    showDownloadPercentage() {
        this.downloadInterval = setInterval(() => {
            console.log(`showDownloadPercentage Downloading...`);
            this.getDownloadPercent();
        }, 1000)
    }

    _disable() {
        if (this.onFirmwareUpdateStateChangeCB) this.onFirmwareUpdateStateChangeCB.dispose();
    }

    async _focus() {
        this.downloadInterval = null;
        this._appApi = new AppApi();
        const downloadState = ['Uninitialized', 'Requesting', 'Downloading', 'Failed', 'DownLoad Complete', 'Validation Complete', 'Preparing to Reboot']
        await this._appApi.getFirmwareUpdateState().then(res => {
            if (res.success) {
                console.log("getFirmwareUpdateState from firmware screen " + JSON.stringify(res))
                this.tag('State.Title').text.text = Language.translate("Firmware State: ") + downloadState[res.firmwareUpdateState]
                if (res.firmwareUpdateState === "Downloading") {
                    this.showDownloadPercentage();
                }
            }
        })

        this._appApi.getDownloadFirmwareInfo().then(res => {
            console.log("getDownloadFirmwareInfo from firmware screen " + JSON.stringify(res))
            this.tag('Version.Title').text.text = Language.translate("Firmware Versions: ") + res.currentFWVersion
        })
        this._setState('FirmwareUpdate')
    }

    getDownloadPercent() {
        this._appApi = new AppApi();
        this._appApi.getFirmwareDownloadPercent().then(res => {
            console.log(`getFirmwareDownloadPercent : ${JSON.stringify(res)}`);
            if (res.downloadPercent < 0) {
                this.tag('DownloadedPercent.Title').visible = false;
                this.tag('DownloadedPercent.Title').text.text = "";
            }
            else {
                this.tag('DownloadedPercent.Title').visible = true;
                this.tag('DownloadedPercent.Title').text.text = Language.translate("Download Progress: ") + res.downloadPercent + "%";
                if (this.downloadInterval === null) {
                    this.downloadInterval = setInterval(() => {
                        this.getDownloadPercent();
                    }, 1000);
                }
            }
        }).catch(err => {
            console.error(err);
        })
    }

    getDownloadFirmwareInfo() {
        this._appApi = new AppApi();
        this._appApi.updateFirmware().then(res => {
            this._appApi.getDownloadFirmwareInfo().then(result => {
                console.log(`getDownloadFirmwareInfo : ${JSON.stringify(result.downloadFWVersion)}`);
                this.tag('DownloadedVersion.Title').text.text = Language.translate('Downloaded Firmware Version: ') + `${result.downloadFWVersion ? result.downloadFWVersion : 'NA'}`
            }).catch(err => {
                console.error(err);
            })
        }).catch(err => {
            console.error(err);
        })
    }

    _handleBack() {
        if(!Router.isNavigating()){
           Router.navigate('settings/advanced/device')
        }
    }

    static _states() {
        return [
            class FirmwareUpdate extends this{
                _handleEnter() {
                    this.getDownloadFirmwareInfo()
                    this.getDownloadPercent()
                }
            }
        ]
    }
}