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
import { Lightning } from '@lightningjs/sdk'
import { COLORS } from '../../colors/Colors'
import { CONFIG } from '../../Config/Config'
import AppApi from '../../api/AppApi';
/**
 * Class for Firmware screen.
 */

export default class FirmwareScreen extends Lightning.Component {
    static _template() {
        return {
            DeviceInfoContents: {
                State: {
                    Title: {
                        x: 10,
                        y: 45,
                        mountY: 0.5,
                        text: {
                            text: `Firmware State: `,
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
                            text: `Firmware Versions: `,
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
                            text: `Downloaded Firmware Version: `,
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
                            text: `Download Progress: `,
                            textColor: COLORS.titleColor,
                            fontFace: CONFIG.language.font,
                            fontSize: 22,
                        }
                    },
                },
                FirmwareUpdate: {
                    RectangleDefault: {
                        x: 110, y: 200, w: 200, mountX: 0.5, h: 50, rect: true, color: CONFIG.theme.hex,
                        Update: {
                            x: 100,
                            y: 25,
                            mount: 0.5,
                            text: {
                                text: "Check for Update",
                                fontFace: CONFIG.language.font,
                                fontSize: 24,
                            },
                        }
                    },
                },
            },
        }
    }

    _focus() {
        this._appApi = new AppApi();
        const downloadState = ['Uninitialized', 'Requesting', 'Downloading', 'Failed', 'DownLoad Complete', 'Validation Complete', 'Preparing to Reboot']
        this._appApi.getFirmwareUpdateState().then(res => {
            console.log("getFirmwareUpdateState from firmware screen " + JSON.stringify(res))
            this.tag('State.Title').text.text = "Firmware State: " + downloadState[res.firmwareUpdateState]
        })

        this._appApi.getDownloadFirmwareInfo().then(res => {
            console.log("getDownloadFirmwareInfo from firmware screen " + JSON.stringify(res))
            this.tag('Version.Title').text.text = "Firmware Versions: " + res.currentFWVersion
        })
        this._setState('FirmwareUpdate')
    }

    getDownloadPercent() {
        this._appApi.getFirmwareDownloadPercent().then(res => {
            this.tag('DownloadedPercent.Title').text.text = "Download Progress: " + res.downloadPercent + "%"
        })
    }

    getDownloadFirmwareInfo() {
        this._appApi.updateFirmware().then(res => {
            this._appApi.getDownloadFirmwareInfo().then(result => {
                this.tag('DownloadedVersion.Title').text.text = `Downloaded Firmware Version: ${result.downloadFWVersion ? result.downloadFWVersion : 'NA'}`
            })
        })
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