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
import ThunderJS from "ThunderJS";
import Keymap from "../Config/Keymap";

const config = {
    host: '127.0.0.1',
    port: 9998,
    default: 1,
};
const thunder = ThunderJS(config);


export function keyIntercept(clientName = "ResidentApp") {
    thunder.Controller.activate({ callsign: 'org.rdk.RDKShell' })
        .then(result => {
            console.log('Successfully activated RDK Shell');
        })
        .catch(err => {
            console.log('Error', err);
        })
        .then(result => {
            thunder.call('org.rdk.RDKShell', 'setFocus', { client: clientName });
        })
        .catch(err => {
            console.log('Error', err);
        })

        .then(result => {
            thunder
                .call('org.rdk.RDKShell', 'addKeyIntercept', {
                    client: clientName,
                    keyCode: Keymap.AudioVolumeMute,
                    modifiers: [],
                })
                .then(result => {
                    console.log('addKeyIntercept success');
                })
                .catch(err => {
                    console.log('Error', err);
                });
        })
        .catch(err => {
            console.log('Error', err);
        })

        .then(result => {
            thunder.on('org.rdk.RDKShell', 'onSuspended', notification => {
                if (notification) {
                    console.log('onSuspended notification from KeyIntercept: ' + notification.client);
                }
            });
        })
        .catch(err => {
            console.log('Error', err);
        })
        .then(result => {
            thunder
                .call('org.rdk.RDKShell', 'addKeyIntercept', {
                    client: clientName,
                    keyCode: Keymap.F1,
                    modifiers: [],
                })
                .catch(err => {
                    console.log('Error', err);
                });
        })
        .catch(err => {
            console.log('Error', err);
        })
        .then(result => {
            thunder
                .call('org.rdk.RDKShell', 'addKeyIntercept', {
                    client: clientName,
                    keyCode: Keymap.Inputs_Shortcut,
                    modifiers: [],
                })
                .catch(err => {
                    console.log('Error', err);
                });
        })
        .catch(err => {
            console.log('Error', err);
        })
        .then(result => {
            thunder
                .call('org.rdk.RDKShell', 'addKeyIntercept', {
                    client: clientName,
                    keyCode: Keymap.Picture_Setting_Shortcut,
                    modifiers: [],
                })
                .catch(err => {
                    console.log('Error', err);
                });
        })
        .catch(err => {
            console.log('Error', err);
        })
        .then(result => {
            thunder
                .call('org.rdk.RDKShell', 'addKeyIntercept', {
                    client: clientName,
                    keyCode: Keymap.Power,
                    modifiers: [],
                })
                .catch(err => {
                    console.log('Error', err);
                });
        })
        .catch(err => {
            console.log('Error', err);
        })

        .then(result => {
            thunder
                .call('org.rdk.RDKShell', 'addKeyIntercept', {
                    client: clientName,
                    keyCode: Keymap.Settings_Shortcut,
                    modifiers: [],
                })
                .catch(err => {
                    console.log('Error', err);
                });
        })
        .catch(err => {
            console.log('Error', err);
        })

        .then(result => {
            thunder
                .call('org.rdk.RDKShell', 'addKeyIntercept', {
                    client: clientName,
                    keyCode: Keymap.AppCarousel,
                    modifiers: [],
                })
                .catch(err => {
                    console.log('Error', err);
                });
        })
        .catch(err => {
            console.log('Error', err);
        })

        .then(result => {
            thunder
                .call('org.rdk.RDKShell', 'addKeyIntercept', {
                    client: clientName,
                    keyCode: Keymap.Youtube,
                    modifiers: [],
                })
                .catch(err => {
                    console.log('Error', err);
                });
        })
        .catch(err => {
            console.log('Error', err);
        })
        .then(result => {
            thunder
                .call('org.rdk.RDKShell', 'addKeyIntercept', {
                    client: clientName,
                    keyCode: Keymap.Amazon,
                    modifiers: [],
                })
                .catch(err => {
                    console.log('Error', err);
                });
        })
        .catch(err => {
            console.log('Error', err);
        })
        .then(result => {
            thunder
                .call('org.rdk.RDKShell', 'addKeyIntercept', {
                    client: clientName,
                    keyCode: Keymap.Netflix,
                    modifiers: [],
                })
                .catch(err => {
                    console.log('Error', err);
                });
        })
        .catch(err => {
            console.log('Error', err);
        })

        .then(result => {
            thunder
                .call('org.rdk.RDKShell', 'addKeyIntercept', {
                    client: clientName,
                    keyCode: Keymap.F7,
                    modifiers: [],
                })
                .catch(err => {
                    console.log('Error', err);
                });
        })
        .catch(err => {
            console.log('Error', err);
        })
        .then(result => {
            thunder
                .call('org.rdk.RDKShell', 'addKeyIntercept', {
                    client: clientName,
                    keyCode: Keymap.AudioVolumeUp,
                    modifiers: [],
                })
                .catch(err => {
                    console.log('Error', err);
                });
        })
        .catch(err => {
            console.log('Error', err);
        })
        .then(result => {
            thunder
                .call('org.rdk.RDKShell', 'addKeyIntercept', {
                    client: clientName,
                    keyCode: Keymap.AudioVolumeDown,
                    modifiers: [],
                })
                .catch(err => {
                    console.log('Error', err);
                });
        })
        .catch(err => {
            console.log('Error', err);
        })
        .then(result => {
            thunder
                .call('org.rdk.RDKShell', 'addKeyIntercept', {
                    client: clientName,
                    keyCode: Keymap.MediaFastForward,
                    modifiers: [],
                })
                .catch(err => {
                    console.log('Error', err);
                });
        })
        .catch(err => {
            console.log('Error', err);
        })
        .then(result => {
            thunder
                .call('org.rdk.RDKShell', 'addKeyIntercept', {
                    client: clientName,
                    keyCode: 142,
                    modifiers: [],
                })
                .catch(err => {
                    console.log('Error', err);
                });
        })
        .catch(err => {
            console.log('Error', err);
        })
        .then(result => {
            thunder
                .call('org.rdk.RDKShell', 'addKeyIntercept', {
                    client: clientName,
                    keyCode: Keymap.Home,
                    modifiers: [],
                })
                .catch(err => {
                    console.log('Error', err);
                });
        })
        .catch(err => {
            console.log('Error', err);
        })
        .then(result => {
            thunder
                .call('org.rdk.RDKShell', 'addKeyIntercept', {
                    client: clientName,
                    keyCode: Keymap.MediaRewind,
                    modifiers: [],
                })
                .catch(err => {
                    console.log('Error', err);
                });
        })
        .catch(err => {
            console.log('Error', err);
        })
        .then(result => {
            thunder
                .call('org.rdk.RDKShell', 'addKeyIntercept', {
                    client: clientName,
                    keyCode: Keymap.Pause,
                    modifiers: [],
                })
                .catch(err => {
                    console.log('Error', err);
                });
        })
        .catch(err => {
            console.log('Error', err);
        })
        .then(result => {
            thunder
                .call('org.rdk.RDKShell', 'addKeyIntercept', {
                    client: 'YouTube',
                    keyCode: Keymap.Home,
                    modifiers: [],
                })
                .catch(err => {
                    console.log('Error', err);
                });
        })
        .catch(err => {
            console.log('Error', err);
        })
        .then(result => {
            thunder
                .call('org.rdk.RDKShell', 'addKeyIntercept', {
                    client: 'YouTubeTV',
                    keyCode: Keymap.Home,
                    modifiers: [],
                })
                .catch(err => {
                    console.log('Error', err);
                });
        })
        .catch(err => {
            console.log('Error', err);
        })
        .then(result => {
            thunder
                .call('org.rdk.RDKShell', 'addKeyIntercept', {
                    client: 'YouTubeKids',
                    keyCode: Keymap.Home,
                    modifiers: [],
                })
                .catch(err => {
                    console.log('Error', err);
                });
        })
        .catch(err => {
            console.log('Error', err);
        })
        .then(result => {
            thunder
                .call('org.rdk.RDKShell', 'addKeyIntercept', {
                    client: 'Amazon',
                    keyCode: Keymap.Home,
                    modifiers: [],
                })
                .catch(err => {
                    console.log('Error', err);
                });
        })
        .catch(err => {
            console.log('Error', err);
        })
        .then(result => {
            thunder
                .call('org.rdk.RDKShell', 'addKeyIntercept', {
                    client: 'YouTube',
                    keyCode: Keymap.Backspace,
                    modifiers: [],
                })
                .catch(err => {
                    console.log('Error', err);
                });
        })
        .catch(err => {
            console.log('Error', err);
        })
        .then(result => {
            thunder
                .call('org.rdk.RDKShell', 'addKeyIntercept', {
                    client: 'Amazon',
                    keyCode: Keymap.Backspace,
                    modifiers: [],
                })
                .catch(err => {
                    console.log('Error', err);
                });
        })
        .catch(err => {
            console.log('Error', err);
        })
}
