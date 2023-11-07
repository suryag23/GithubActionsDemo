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

import { Localization } from '@firebolt-js/sdk'

export default class FBTLocalization{
    additionalInfo()
    {
        return new Promise((resolve,reject)=>{
        Localization.additionalInfo()
        .then(info => {
            console.log(info)
            resolve(info)
        })
        .catch(err => {
            console.error('firebolt Localization.additionalInfo error', err)
            reject(err)
          })
        })
    }
    countryCode()
    {
        return new Promise((resolve,reject)=>{
        Localization.countryCode()
        .then(code => {
            console.log(code)
            resolve(code)
        })
        .catch(err => {
            console.error('firebolt Localization.countryCode error', err)
            reject(err)
          })
        })
    }
    locality()
    {
        return new Promise((resolve,reject)=>{
        Localization.locality()
        .then(locality => {
            console.log(locality)
        })
        .catch(err => {
            console.error('firebolt Localization.locality error', err)
            reject(err)
          })
        })
    }
    latlon()
    {
        return new Promise((resolve,reject)=>{
        Localization.latlon()
        .then(latlong => {
            console.log(latlong)
            resolve(latlon)
        })
        .catch(err => {
            console.error('firebolt Localization.latlon error', err)
            reject(err)
          })
        })
    }

}