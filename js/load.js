// author: Tegan Burns
// website: teganburns.com

// PhantomJs Script to Automate Headless Interaction with Devrant
// Copyright 2018 Tegan Burns
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//     http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

//"use strict";
//var system = require('system');
//if (system.args.length === 1) {
//    console.log('Try to pass some args when invoking this script!');
//} else {
//    system.args.forEach(function (arg, i) {
//        console.log(i + ': ' + arg);
//    });
//}
//phantom.exit();


// Const Endpoints
const devrant = 'https://devrant.com/';
const devrant_api = 'https://devrant.com/api/';
const devrant_api_users = 'https://devrant.com/api/users/';
const devrant_api_users_authToken= 'https://devrant.com/api/users/auth-token/';

const devrant_feed = "https://devrant.com/feed/";
const devrant_feed_algo = "https://devrant.com/feed/algo";
const devrant_feed_recent = "https://devrant.com/feed/recent/";

const devrant_feed_top_day = "https://devrant.com/feed/day";
const devrant_feed_top_week = "https://devrant.com/feed/week";
const devrant_feed_top_month = "https://devrant.com/feed/month";
const devrant_feed_top_all = "https://devrant.com/feed/all";

// Global vars
var app = "3";
var username = "";
var password = "";
var guid = "";
var plat = "";
var sid = "";
var seid = "";

//phantom.onError = function(msg, trace) {
//    var msgStack = ['PHANTOM ERROR: ' + msg];
//    if (trace && trace.length) {
//        msgStack.push('TRACE:');
//        trace.forEach(function(t) {
//            msgStack.push(' -> ' + (t.file || t.sourceURL) + ': ' + t.line + (t.function ? ' (in function ' + t.function +')' : ''));
//        });
//    }
//    console.log(msgStack.join('\n'));
//    phantom.exit(1);
//};

function init() {

    var page = require('webpage').create();
    page.viewportSize = { width: 1920, height: 1080 }
    page.onConsoleMessage = function(msg) { console.log(msg); };
    page.open( devrant, function(status) {

        if (status !== 'success') {
            console.log('Unable to access network');

        } else {

            var ua = page.evaluate(function() {
                var aTags = document.getElementsByTagName('a');
                var loginText = 'Login';

                for ( var i = 0; i < aTags.length; i++ ) {
                    if ( aTags[i].textContent == loginText ) {
                        return aTags[i];
                    }
                }
            });
            console.log(ua);

        }

        console.log( 'Cookies: ' + JSON.stringify( phantom.cookies ) );
        phantom.exit();

    });
}












