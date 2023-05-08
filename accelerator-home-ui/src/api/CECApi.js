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
import ThunderJS from 'ThunderJS';

const config = {
    host: '127.0.0.1',
    port: 9998,
    default: 1,
}
const thunder = ThunderJS(config)

export default class CECApi {
    activate() {
        return new Promise((resolve, reject) => {
            thunder.Controller.activate({ callsign: 'org.rdk.HdmiCec_2' })
                .then(() => {
                    resolve(true)
                })
                .catch(err => {
                    console.log('CEC Error Activation', err)
                })
        })
    }
    deactivate() {
        return new Promise((resolve, reject) => {
            thunder.Controller.deactivate({ callsign: 'org.rdk.HdmiCec_2' })
                .then(() => {
                    resolve(true)
                })
                .catch(err => {
                    console.log('CEC Error Deactivation', err)
                })
        })
    }
    getEnabled() {
        return new Promise((resolve, reject) => {
            thunder.call('org.rdk.HdmiCec_2', 'getEnabled')
                .then(result => {
                    resolve(result)
                })
                .catch(err => {
                    resolve({ enabled: false })
                })
        })
    }

    setEnabled() {
        return new Promise((resolve, reject) => {
            thunder.call('org.rdk.HdmiCec_2', 'setEnabled', { enabled: true })
                .then(result => {
                    resolve(result)
                })
                .catch(err => {
                    console.error('CEC Set Enabled', err)
                    resolve({ success: false })
                })
        })
    }

    performOTP() {
        return new Promise((resolve, reject) => {
            thunder.call('org.rdk.HdmiCec_2', 'performOTPAction')
                .then(result => {
                    resolve(result)
                })
                .catch(err => {
                    console.error('CEC Otp Error', err)
                    resolve({ success: false })
                })
        })
    }

    getActiveSourceStatus() {
        return new Promise((resolve, reject) => {
          thunder.call('org.rdk.HdmiCec_2', 'getActiveSourceStatus')
            .then(result => {
              resolve(result.status)
            })
            .catch(err => {
              console.error("CECApi HdmiCec_2 getActiveSourceStatus failed." + err);
              reject(err)
            })
        })
    }
}