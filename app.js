//
// Wall Clocks
// Single page web app for multi-timezone clocks suitable for a monitor wall.
// Bob King  bob@getready1.com
// 
// The clock config is stored in the browser's local storage.

var DEFAULT_CLOCK_CONFIG = {

    "notes": `
    - Available Layouts: 4, 8
    - For timezones see https://nodatime.org/TimeZones
    - "timezone" refers to the IANA TimezoneID
    - "name" is the string to display in the clock
    `,

    "layout": "8",
    "clocks": [{
            "timezone": "GMT",
            "name": "GMT"
        },
        {
            "timezone": "America/New_York",
            "name": "New York"
        },
        {
            "timezone": "America/Los_Angeles",
            "name": "Los Angeles"
        },
        {
            "timezone": "America/Denver",
            "name": "Denver"
        },
        {
            "timezone": "America/Chicago",
            "name": "Chicago"
        },
        {
            "timezone": "Europe/Paris",
            "name": "Paris"
        },
        {
            "timezone": "Asia/Dubai",
            "name": "Dubai"
        },
        {
            "timezone": "Asia/Singapore",
            "name": "Singapore"
        }
    ]
};

// ===== for reference =====
// {
//     "count": 2,
//     "size": "big",
// }, {
//     "count": 3,
//     "size": "med",
// },
// {
//     "count": 4,
//     "size": "small",
// },
// ===== end reference =====

var clock_layouts = {
    "8": [
        3, [{
                "count": 2,
                "size": "big",
            },
            {
                "count": 3,
                "size": "med",
            },
            {
                "count": 3,
                "size": "med",
            }
        ]
    ],
    "4": [
        2, [{
            "count": 2,
            "size": "big",
        }, {
            "count": 2,
            "size": "big",
        }]
    ]
}

// put the config in the browser's local storage
var store_clock_config = function(config) {
    localStorage.setItem('ready1_clock_config', config);
}

// retrieve the config from the browser's local storage
var get_clock_config = function() {
    if (localStorage.getItem('ready1_clock_config') != null) {
        // 
        return JSON.parse(localStorage.getItem('ready1_clock_config'));
    } else {
        console.log('No clock data in local storage.  Setting to default.');
        return DEFAULT_CLOCK_CONFIG;
    }
}

var delete_clock_config = function() {
    if (localStorage.getItem('ready1_clock_config') != null) {
        localStorage.removeItem('ready1_clock_config');
        console.log('Local clock data deleted.');
    } else {
        console.log('No clock data in local storage.');
    }
}

var make_a_clock_row = function(size) {
    return `<div class="row clock-row-` + size + `">`;
}
var make_a_clock = function(size, number, clocks_per_row) {
    var num_cols = 12 / clocks_per_row;
    var new_clock = `
    <div class = "col-${num_cols} clock-${size}" id = "clock-${number}" >
        <div class="clock-name clock-name-${size}" id="clock-name-${number}">Name</div> 
        <div class="clock-time clock-time-${size}"id="clock-time-${number}">12:59:59</div> 
        <div class="clock-date clock-date-${size}" id="clock-date-${number}">Monday 12-22-99</div> 
    </div> `;
    return new_clock;
}

var make_a_page = function(config, layouts) {
    var new_page = "";
    var clock_number = 0;
    var layout = layouts[config["layout"]];
    var row_count = layout[0];
    for (var r = 0; r < row_count; r++) {
        var new_row = make_a_clock_row(layout[1][r]["size"]);
        new_page += new_row.toString();
        for (var c = 0; c < layout[1][r]["count"]; c++) {
            new_page += make_a_clock(layout[1][r]["size"], clock_number, layout[1][r]["count"]);
            clock_number += 1;
        }
        new_page += "</div>";
    }
    return new_page;
}

var format_time = function(now, timezone) {
    var offset_now = now.setZone(timezone);
    return offset_now.toLocaleString(luxon.DateTime.TIME_24_WITH_SECONDS);
}

var format_date = function(now, timezone) {
    // change the timezone
    var offset_now = now.setZone(timezone);
    // calculate the reference offset in hours
    var ref_offset = (offset_now.offset - now.offset) / 60;
    // format the reference offset string
    var ref_offset_str = "J";
    ref_offset_str += ref_offset < 0 ? ref_offset.toString() : "+" + ref_offset.toString();
    // create the date string weekday
    var date_string = offset_now.toFormat('EEE');
    // add the date
    date_string += " " + offset_now.toLocaleString(luxon.DateTime.DATE_SHORT);
    // add the reference time offset
    date_string += " " + ref_offset_str;
    return date_string;
}

var update_clocks_html = function(clocks) {
    var now = new luxon.DateTime.local();

    for (var c = 0; c < clocks.length; c += 1) {
        var cur_clock = clocks[c];
        var clock_name_id = "#clock-name-" + c;
        var clock_time_id = "#clock-time-" + c;
        var clock_date_id = "#clock-date-" + c;
        var clock_time = format_time(now, cur_clock["timezone"]);
        var clock_date = format_date(now, cur_clock["timezone"]);
        el_name = $(clock_name_id).html(cur_clock["name"]);
        el_time = $(clock_time_id).html(clock_time);
        el_date = $(clock_date_id).html(clock_date);
    }
}

var run_clocks = function(clocks) {
    let interval = setInterval(update_clocks_html, 250, clocks);
}

var openFullScreen = function() {
    var elem = document.getElementById("clock-container");
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) { /* Safari */
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE11 */
        elem.msRequestFullscreen();
    }
}


var configModal = document.getElementById('config-modal');
configModal.addEventListener('show.bs.modal', function(event) {
    $("#config-textarea").val(JSON.stringify(get_clock_config()));
});

var saveConfigBtn = document.getElementById("btn-save-config");
saveConfigBtn.addEventListener('click', function(event) {
    store_clock_config($("#config-textarea").val());
    var c = get_clock_config();
    $("#clock-container").html(make_a_page(c, clock_layouts));
});

var defaultConfigBtn = document.getElementById("btn-default-config");
defaultConfigBtn.addEventListener('click', function(event) {
    $("#config-textarea").val(JSON.stringify(DEFAULT_CLOCK_CONFIG));
});

var deleteConfigBtn = document.getElementById("btn-delete-config");
deleteConfigBtn.addEventListener('click', function(event) {
    delete_clock_config();
});

var fullScreenMenuItem = document.getElementById("full-screen-item");
fullScreenMenuItem.addEventListener('click', function(event) {
    openFullScreen();
})



$(document).ready(function() {
    var config = get_clock_config();
    $("#clock-container").html(make_a_page(config, clock_layouts));
    run_clocks(config["clocks"]);
});