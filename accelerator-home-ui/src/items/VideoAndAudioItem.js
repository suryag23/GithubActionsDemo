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
import { CONFIG } from '../Config/Config.js'
import AppApi from '../api/AppApi'

export default class VideoAndAudioItem extends Lightning.Component {

  _construct() {
    this.Tick = Utils.asset('/images/settings/Tick.png')
  }
  static _template() {
    return {
      zIndex: 1,
      TopLine: {
        y: 0,
        mountY: 0.5,
        w: 1600,
        h: 3,
        rect: true,
        color: 0xFFFFFFFF
      },
      Item: {
        w: 1920 - 300,
        h: 90,
        rect: true,
        color: 0x00000000,
      },
      BottomLine: {
        y: 0 + 90,
        mountY: 0.5,
        w: 1600,
        h: 3,
        rect: true,
        color: 0xFFFFFFFF
      },
    }
  }

  _init() {
    if (this.isTicked) {
      this.fireAncestors("$resetPrevTickObject", this);
    }
    this.appApi = new AppApi();
  }

  _handleEnter() {
    if (this.videoElement === true) {
      this.appApi.setResolution(this._item).catch(err => {
        console.log(`there was an error while setting the resolution.` + JSON.stringify(err));
      });
    }
    else {
      this.appApi.setSoundMode(this._item)
        .then(result => {
          if (result.success === true) {
            this.fireAncestors("$resetPrevTickObject", this)
            this.tag("Item.Tick").visible = true;
            // this.tag('HdmiAudioOutputStereo.Title').text.text = 'HdmiAudioOutputStereo: ' + soundMode
          }
          //this.tag('HdmiAudioOutputStereo.Title').text.text = 'HdmiAudioOutputStereo: ' + result.soundMode
          this.fireAncestors("$updateSoundMode", this._item)
        })
        .catch(err => {
          console.log('Some error while setting the sound mode ', err)
        })
    }
  }

  set item(item) {
    this._item = item
    this.tag('Item').patch({
      Tick: {
        x: 10,
        y: 45,
        mountY: 0.5,
        texture: Lightning.Tools.getSvgTexture(this.Tick, 32.5, 32.5),
        color: 0xffffffff,
        visible: this.isTicked ? true : false //implement the logic to show the tick
      },
      Left: {
        x: 50,
        y: 45,
        mountY: 0.5,
        text: { text: item, fontSize: 25, textColor: 0xffFFFFFF, fontFace: CONFIG.language.font, }, // update the text
      },
    })

  }

  _focus() {
    this.tag('TopLine').color = CONFIG.theme.hex
    this.tag('BottomLine').color = CONFIG.theme.hex
    this.patch({
      zIndex: 2
    })
    this.tag('TopLine').h = 6
    this.tag('BottomLine').h = 6
  }

  _unfocus() {
    this.tag('TopLine').color = 0xFFFFFFFF
    this.tag('BottomLine').color = 0xFFFFFFFF
    this.patch({
      zIndex: 1
    })
    this.tag('TopLine').h = 3
    this.tag('BottomLine').h = 3
  }
}
