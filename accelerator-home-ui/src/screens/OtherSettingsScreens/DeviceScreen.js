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
import { Lightning, Utils } from '@lightningjs/sdk'
import SettingsMainItem from '../../items/SettingsMainItem'
import { COLORS } from '../../colors/Colors'
import { CONFIG } from '../../Config/Config'
import DeviceInformationScreen from './DeviceInformationScreen'
import AppApi from '../../api/AppApi';
import FirmwareScreen from './FirmwareScreen'
import RebootConfirmationScreen from './RebootConfirmationScreen'

/**
 * Class for Video and Audio screen.
 */

export default class DeviceScreen extends Lightning.Component {
    static _template() {
        return {
            x: 0,
            y: 0,
            DeviceScreenContents: {
                Info: {
                    type: SettingsMainItem,
                    Title: {
                        x: 10,
                        y: 45,
                        mountY: 0.5,
                        text: {
                            text: 'Info',
                            textColor: COLORS.titleColor,
                            fontFace: CONFIG.language.font,
                            fontSize: 25,
                        }
                    },
                    Button: {
                        h: 45,
                        w: 45,
                        x: 1600,
                        mountX: 1,
                        y: 45,
                        mountY: 0.5,
                        src: Utils.asset('images/settings/Arrow.png'),
                    },
                },
                Firmware: {
                    y: 90,
                    type: SettingsMainItem,
                    Title: {
                        x: 10,
                        y: 45,
                        mountY: 0.5,
                        text: {
                            text: 'Check for Firmware Update',
                            textColor: COLORS.titleColor,
                            fontFace: CONFIG.language.font,
                            fontSize: 25,
                        }
                    },
                    Button: {
                        h: 45,
                        w: 45,
                        x: 1600,
                        mountX: 1,
                        y: 45,
                        mountY: 0.5,
                        src: Utils.asset('images/settings/Arrow.png'),
                    },
                },
                Reboot: {
                    y: 180,
                    type: SettingsMainItem,
                    Title: {
                        x: 10,
                        y: 45,
                        mountY: 0.5,
                        text: {
                            text: 'Reboot',
                            textColor: COLORS.titleColor,
                            fontFace: CONFIG.language.font,
                            fontSize: 25,
                        }
                    },
                },
                Reset: {
                    y: 270,
                    alpha: 0.3, // disabled
                    type: SettingsMainItem,
                    Title: {
                        x: 10,
                        y: 45,
                        mountY: 0.5,
                        text: {
                            text: 'Factory Reset',
                            textColor: COLORS.titleColor,
                            fontFace: CONFIG.language.font,
                            fontSize: 25,
                        }
                    },
                    Button: {
                        h: 45,
                        w: 45,
                        x: 1600,
                        mountX: 1,
                        y: 45,
                        mountY: 0.5,
                        src: Utils.asset('images/settings/Arrow.png'),
                    },
                },
            },

            DeviceInformationScreen: {
                type: DeviceInformationScreen,
                visible: false,
            },
            FirmwareScreen: {
                type: FirmwareScreen,
                visible: false,
            },
            RebootConfirmationScreen: {
                x: 780,
                y: 100,
                type: RebootConfirmationScreen,
                visible: false,
            },

        }

    }

    _init() {
        this._appApi = new AppApi();
    }

    _focus() {
        this._setState('Info')
    }


    hide() {
        this.tag('DeviceScreenContents').visible = false
    }

    show() {
        this.tag('DeviceScreenContents').visible = true
    }

    static _states() {
        return [
            class Info extends this{
                $enter() {
                    this.tag('Info')._focus()
                }
                $exit() {
                    this.tag('Info')._unfocus()
                }
                _handleUp() {
                    this._setState('Reboot');
                }
                _handleDown() {
                    this._setState('Firmware')
                }
                _handleEnter() {
                    this._setState('DeviceInformationScreen')
                }
            },
            class Firmware extends this{
                $enter() {
                    this.tag('Firmware')._focus()
                }
                $exit() {
                    this.tag('Firmware')._unfocus()
                }
                _handleUp() {
                    this._setState('Info');
                }
                _handleDown() {
                    this._setState('Reboot')
                }
                _handleEnter() {
                    this._setState('FirmwareScreen')
                }
            },
            class Reboot extends this{
                $enter() {
                    this.tag('Reboot')._focus()
                }
                $exit() {
                    this.tag('Reboot')._unfocus()
                }
                _handleUp() {
                    this._setState('Firmware');
                }
                _handleDown() {
                    this._setState('Info')
                }
                _handleEnter() {
                    this._setState('RebootConfirmationScreen')
                }
            },
            class Reset extends this{
                $enter() {
                    this.tag('Reset')._focus()
                }
                $exit() {
                    this.tag('Reset')._unfocus()
                }
                _handleUp() {
                    //this._setState('Reboot');
                }
                _handleDown() {
                    //this._setState('Info')
                }
                _handleEnter() {

                }
            },


            //Inner Screens Classes
            class DeviceInformationScreen extends this {
                $enter() {
                    this.hide()
                    this.tag('DeviceInformationScreen').visible = true
                    this.fireAncestors('$changeHomeText', 'Settings / Other Settings / Advanced Settings / Device / Info')
                }
                _getFocused() {
                    return this.tag('DeviceInformationScreen')
                }
                $exit() {
                    this.show()
                    this.tag('DeviceInformationScreen').visible = false
                    this.fireAncestors('$changeHomeText', 'Settings / Other Settings / Advanced Settings / Device')
                }
                _handleBack() {
                    this._setState('Info')
                }
            },
            //Inner Firmware Screen
            class FirmwareScreen extends this {
                $enter() {
                    this.hide()
                    this.tag('FirmwareScreen').visible = true
                    this.fireAncestors('$changeHomeText', 'Settings / Other Settings / Advanced Settings / Device / Firmware')
                }
                _getFocused() {
                    return this.tag('FirmwareScreen')
                }
                $exit() {
                    this.show()
                    this.tag('FirmwareScreen').visible = false
                    this.fireAncestors('$changeHomeText', 'Settings / Other Settings / Advanced Settings / Device')
                }
                _handleBack() {
                    this._setState('Firmware')
                }
            },

            class RebootConfirmationScreen extends this{
                $enter() {
                    this.hide()
                    this.tag('RebootConfirmationScreen').visible = true
                }
                _getFocused() {
                    return this.tag('RebootConfirmationScreen')
                }
                $exit() {
                    this.show()
                    this.tag('RebootConfirmationScreen').visible = false
                }
                $confirmReboot() {
                    this._appApi.reboot().then(result => {
                        console.log('device rebooting from device screen ' + JSON.stringify(result))
                    })
                }

                $cancelReboot() {
                    this._handleBack()
                }
                _handleBack() {
                    this._setState('Reboot')
                }
            },

        ]
    }


}