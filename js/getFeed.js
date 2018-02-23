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
const devrant_api_users = 'https://devrant.com/api/users';
const devrant_api_users_authToken = 'https://devrant.com/api/users/auth-token'; // Notice: Has no trailing slash

const devrant_feed = "https://devrant.com/feed/";
const devrant_feed_algo = "https://devrant.com/feed/algo";
const devrant_feed_recent = "https://devrant.com/feed/recent/";

const devrant_feed_top_day = "https://devrant.com/feed/top/day/rants";
const devrant_feed_top_week = "https://devrant.com/feed/top/week/rants";
const devrant_feed_top_month = "https://devrant.com/feed/top/month/rants";
const devrant_feed_top_all = "https://devrant.com/feed/top/all/rants";

// Global vars
var app = 3;
var type = 1;
var guid = "";
var plat = "";
var sid = "";
var seid = "";
var feed_type = "";

"use strict";
var system = require('system');
var args = system.args;

if (args.length === 2) {
    feed_type=args[1];
} else { console.log('Invalid arguments'); }

switch (feed_type) {
    case 'feed': feed_type = devrant_feed; break;
    case 'algo': feed_type = devrant_feed_algo; break;
    case 'recent': feed_type = devrant_feed_recent; break;
    case 'day': feed_type = devrant_feed_top_day; break;
    case 'week': feed_type = devrant_feed_top_week; break;
    case 'month': feed_type = devrant_feed_top_month; break;
    case 'all': feed_type = devrant_feed_top_all; break;
    default: feed_type = devrant_feed; break;
}

console.log( "feed_type: " + feed_type );

// Post login data and get token
var page = require('webpage').create();
page.viewportSize = { width: 1920, height: 1080 }
page.onConsoleMessage = function(msg) { console.log(msg); };

page.open( feed_type, function ( status ) {
    if (status !== 'success') { console.log('Connection issue!');
    } else {
        console.log( 'OK' );
        var res = page.evaluate(function() {
            var rants_array = Array();
            var rants = document.getElementsByClassName('rantlist-title-text');
            for ( var i = 0; i < rants.length; i++ ) {
                rants_array.push( rants[i].textContent );
            }
            return rants_array;
        });
        //console.log( res );
        console.log( JSON.stringify( res ) );
    }
    phantom.exit();
});


