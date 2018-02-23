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


// Const Endpoints
const devrant = 'https://devrant.com/';
const devrant_api = 'https://devrant.com/api/';
const devrant_api_users = 'https://devrant.com/api/users/';
const devrant_api_users_authToken = 'https://devrant.com/api/users/auth-token'; // Notice: Has no trailing slash

const devrant_feed = "https://devrant.com/feed/";
const devrant_feed_algo = "https://devrant.com/feed/algo";
const devrant_feed_recent = "https://devrant.com/feed/recent/";

const devrant_feed_top_day = "https://devrant.com/feed/day";
const devrant_feed_top_week = "https://devrant.com/feed/week";
const devrant_feed_top_month = "https://devrant.com/feed/month";
const devrant_feed_top_all = "https://devrant.com/feed/all";

// Global vars
var app = 3;
var username = "";
var password = "";
var guid = "";
var plat = "";
var sid = "";
var seid = "";

"use strict";
var system = require('system');
var args = system.args;

if (args.length === 3) {
    username=args[1]; password=args[2];
} else { console.log('Invalid arguments'); }

// Post login data and get token
var page = require('webpage').create();
page.viewportSize = { width: 1920, height: 1080 }
page.onConsoleMessage = function(msg) { console.log(msg); };
var settings = {
    operation: "POST",
    encoding: "utf-8",
    headers: { "Content-Type": "application/json" },
    data: JSON.stringify({
        "app": app,
        "username": username,
        "password": password
    })
};

page.open( devrant_api_users_authToken, settings, function ( status ) {
    if (status !== 'success') { console.log('Connection issue!');
    } else { console.log( page.plainText ); }
    phantom.exit();
});


