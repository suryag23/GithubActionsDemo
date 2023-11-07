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
import { Router } from '@lightningjs/sdk'

export default class AckChallengeProvider {

  challenge(challenge, session) {
    if (!challenge) return
    console.log("Got challenge req:" + JSON.stringify(challenge) + "challenge")
    return new Promise((resolve, reject) => {
      this.showChallengeUi(challenge, resolve)
      session.focus()
    })
  }

  showChallengeUi(challenge, responder) {
    new Promise(async (resolve, reject) => {
    let message= 'Do you give access to ' + challenge.requestor.name + ' to ' + challenge.capability + '?'
    let params={message:message, responder}
    Router.navigate('settings/other/AcknowledgeScreen',params)
    resolve(true)
    })
  }
}
