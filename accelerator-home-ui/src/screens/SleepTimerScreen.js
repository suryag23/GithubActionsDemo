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
import { Language, Lightning, Router, Storage } from '@lightningjs/sdk'
import SettingsItem from '../items/SettingsItem'

export default class SleepTimerScreen extends Lightning.Component {

    _onChanged() {
        this.widgets.menu.updateTopPanelText(Language.translate('Settings  Other Settings  Sleep Timer'));
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
            SleepTimer: {
                y: 275,
                x: 200,
                List: {
                    w: 1920 - 300,
                    type: Lightning.components.ListComponent,
                    itemSize: 90,
                    horizontal: false,
                    invertDirection: true,
                    roll: true,
                    rollMax: 900,
                    itemScrollOffset: -5,
                }
            }
        }
    }
    _firstEnable() {
        this.lastElement = false
        this.options = [
            { value: 'Off', tick: true },
            { value: '15 Minutes', tick: false },
            { value: '1 Hour', tick: false },
            { value: '1.5 Hours', tick: false },
            { value: '2 Hours', tick: false },
            { value: '3 Hours', tick: false }
        ]
        this.tag('List').h = this.options.length * 90
        let timeoutInterval = Storage.get('TimeoutInterval');
        if (!timeoutInterval) {
            timeoutInterval = 'Off'
        }
        let index = 0;
        this.tag('List').items = this.options.map((item, id) => {
            if (timeoutInterval === item.value) {
                index = id;
            }
            return {
                w: 1920 - 300,
                h: 90,
                type: SettingsItem,
                item: item.value
            }
        })
        this.tag('List').getElement(index).tag('Tick').visible = true
        this.fireAncestors('$registerInactivityMonitoringEvents').then(res => {
            this.fireAncestors('$resetSleepTimer', timeoutInterval);
        }).catch(err => {
            console.error(`error while registering the inactivity monitoring event`)
        })

        this._setState('Options')
    }

    _handleBack() {
        if(!Router.isNavigating()){
            Router.navigate('settings/other')
        }
    }

    static _states() {
        return [
            class Options extends this{
                _getFocused() {
                    return this.tag('List').element
                }
                _handleDown() {
                    this.tag('List').setNext()
                }
                _handleUp() {
                    this.tag('List').setPrevious()
                }
                _handleEnter() {
                    this.options.forEach((element, idx) => {
                        //if (element.tick) {
                        this.tag('List').getElement(idx).tag('Tick').visible = false
                        //this.options[idx].tick = false
                        //}
                    });
                    this.tag('List').element.tag('Tick').visible = true
                    //this.options[this.tag('List').index].tick = true
                    this.fireAncestors('$sleepTimerText', this.options[this.tag('List').index].value)
                    this.fireAncestors('$resetSleepTimer', this.options[this.tag('List').index].value);
                }
            }
        ]
    }
}