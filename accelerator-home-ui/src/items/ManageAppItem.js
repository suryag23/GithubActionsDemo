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

import { Lightning, Utils } from "@lightningjs/sdk";
import { CONFIG } from "../Config/Config";
import StatusProgress from '../overlays/StatusProgress'
import { uninstallDACApp } from '../api/DACApi'

export default class ManageAppItem extends Lightning.Component {
    static _template() {
        return {
            Shadow: {
                y: -10,
                alpha: 0,
                rect: true,
                color: CONFIG.theme.hex,
                h: this.height + 20,
                w: this.width,
            },
            Image: {
                h: this.height,
                w: this.width
            },
            Overlay: {
                alpha: 0,
                rect: true,
                color: 0xFF000000,
                h: this.height,
                w: this.width,
                OverlayText: {
                    alpha: 0,
                    mount: 0.5,
                    x: this.width / 2,
                    y: this.height / 2,
                    text: {
                        text: "Uninstalling App ..",
                        fontFace: CONFIG.language.font,
                        fontSize: 30,

                    },
                },
            },
            Text: {
                alpha: 0,
                y: this.height + 10,
                text: {
                    text: '',
                    fontFace: CONFIG.language.font,
                    fontSize: 25,
                },
            },
            StatusProgress: {
                type: StatusProgress, x:50, y: 80, w: 200,
            },
        }
    }

    set info(data) {
        if(!data.hasOwnProperty('url'))
            data.url = "/images/apps/DACApp_455_255.png";
        this.data = data
        if (data.url.startsWith('/images')) {
            this.tag('Image').patch({
                src: Utils.asset(data.url),
            });
        } else {
            this.tag('Image').patch({
                src: data.url,
            });
        }
        this.tag('Text').text.text = data.installed[0].appName
    }

    static get width() {
        return 300
    }

    static get height() {
        return 168
    }

    async $fireDACOperationFinished(success, msg)  {
        if (this._app.isUnInstalling) {
           this._app.isInstalled = !success
           this._app.isUnInstalling = false
           let temp= await this.displayLabel().then((res)=>{
            setTimeout(()=> {
                this.fireAncestors('$refreshManagedApps')
            },500)
           });
           if (!success) {
              this.tag('StatusProgress').setProgress(1.0, 'Error: '+ msg)
           }
        }
      }

    displayLabel()
    {
        return new Promise((resolve,reject)=>{
            this.tag("OverlayText").text.text="App Uninstalled"
            this.tag("Overlay").alpha=0.7
            this.tag("OverlayText").alpha=1
            this.tag("Overlay").setSmooth('alpha', 0, {duration: 5})
            resolve();
        });
    }

    async myfireUNINSTALL() {
        this._app.isUnInstalling = await uninstallDACApp(this._app, this.tag('StatusProgress'))
    }

    _init() {
        this._app = {}
        this._app.isRunning = false
        this._app.isInstalled = false
        this._app.isInstalling = false
        this._app.isUnInstalling = false
        this._buttonIndex = 0;
    }

    _focus() {
        this.scale = 1.15
        this.zIndex = 2
        this.tag("Shadow").alpha = 1
        this.tag("Text").alpha = 1
    }
    _unfocus() {
        this.scale = 1
        this.zIndex = 1
        this.tag("Shadow").alpha = 0
        this.tag("Text").alpha = 0
    }
    _handleEnter() {
        this._app.url = this.data.installed[0].url
        this._app.id = this.data.id
        this._app.name = this.data.installed[0].appName
        this._app.version = this.data.installed[0].version
        this._app.type= this.data.type
        this.myfireUNINSTALL()
    }
}

