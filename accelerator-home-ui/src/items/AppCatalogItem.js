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

import { Lightning, Utils, Language, Storage } from "@lightningjs/sdk";
import { CONFIG } from "../Config/Config";
import StatusProgress from '../overlays/StatusProgress'
import { installDACApp, getInstalledDACApps } from '../api/DACApi'

export default class AppCatalogItem extends Lightning.Component {
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
                        text: "Already installed!",
                        fontFace: CONFIG.language.font,
                        fontSize: 20,
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
        this.tag('Text').text.text = data.name
    }

    static get width() {
        return 300
    }

    static get height() {
        return 168
    }

    async $fireDACOperationFinished(success, msg)  {
        if (this._app.isInstalling) {
             this._app.isInstalled = success
             this._app.isInstalling = false
             this.updateStatus()
             if (!success) {
                this.tag('StatusProgress').setProgress(1.0, 'Error: '+ msg)
             }
          } else if (this._app.isUnInstalling) {
            this._app.isInstalled = !success
            this._app.isUnInstalling = false
            this.updateStatus()
            if (!success) {
               this.tag('StatusProgress').setProgress(1.0, 'Error: '+ msg)
            }
         }
       }

        updateStatus() {
        if (this._app.isRunning) {
          this.tag('StatusProgress').setProgress(1.0, 'Running!')
        } else {
          if (this._app.isInstalled) {
            console.log("App is installed")
            this.tag('StatusProgress').setProgress(1.0, 'Installed!')
          } else {
            this.tag('StatusProgress').reset()
          }
        }
      }
      async myfireINSTALL() {
        if (this._app.isInstalled) {
            console.log("App is already installed")
            this.tag("Overlay").alpha=0.7
            this.tag("OverlayText").alpha=1
            this.tag("Overlay").setSmooth('alpha', 0, {duration: 5})
            return
        }
        this._app.isInstalling = await installDACApp(this._app, this.tag('StatusProgress'))
        this.updateStatus()
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
    async _handleEnter(){
        this._app.url = this.data.uri
        this._app.id = this.data.id
        this._app.name = this.data.name
        this._app.version = this.data.version
        this._app.type = this.data.type
        let installedApps = await getInstalledDACApps()
        this._app.isInstalled = installedApps.find((a) => {
            return a.id === this._app.id })
        if (this._app.isInstalled === undefined)
            this._app.isInstalled = false
        this.myfireINSTALL()
    }
}

