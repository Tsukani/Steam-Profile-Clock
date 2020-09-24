//Libraries
const SteamUser = require('steam-user');
const client = new SteamUser();
const SteamTotp = require('steam-totp');
const request = require('request');
const SteamID = require('steamid');
const config = require('./config.json');

//Colors
const colors = {
    red: "\x1b[31m%s\x1b[0m",
    purple: "\x1b[35m%s\x1b[0m",
    green: "\x1b[32m%s\x1b[0m",
    cyan: "\x1b[36m%s\x1b[0m",
    yellow: "\x1b[33m%s\x1b[0m"
}

//Account Credentials
const logOnOptions = {
  accountName: config.account.username,
  password: config.account.password,
  twoFactorCode: SteamTotp.generateAuthCode(config.account.sharedSecret),
  rememberPassword: true
};

console.log(colors.cyan, "Steam digital clock showcase\nMade by Tsukani/zyN\nMake sure to read through the documentation first to ensure everything is set up correctly!\n");
console.log(colors.yellow, `Using ${config.time12Hours ? "12" : "24"} hour ${config.centerTime ? "centered" : "non-centered"} time format.`);
if (config.timezoneOffset) console.log(colors.yellow, `Using a ${config.timezoneOffset} hour offset.`);

//Login
client.logOn(logOnOptions);
console.log(colors.purple, "Attempting to login...");
client.on("loggedOn", () => {
  console.log(colors.green, "Successfully logged into Steam!");
});

//Login Error
client.on('error', function(e) {
    if (!e.toString().includes("LogonSessionReplaced")) return console.log(colors.red, `Failed to login: ${e.toString()}`);
});

//Get webSession (sessionID, Cookies and steamID64) and initiate main function
client.on("webSession", function(sessionID, cookies) {
    ownSteamID = new SteamID(cookies[1].split("%7")[0].split("steamLogin=")[1]);
    clock(sessionID, cookies);
    console.log(colors.green, "Successfully acquired sessionID and Cookies!");
    var now = new Date();
    var timeUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
    updateTimeout = setTimeout(() => {
        clock(sessionID, cookies);
        updateInterval = setInterval(() => {
            clock(sessionID, cookies);
        }, 60000);
    }, timeUntilNextMinute);
});

//Main function
function clock(sessionID, cookies) {
    d = new Date();
    d.setHours(d.getHours() + config.timezoneOffset);
    time = d.toLocaleString("en-US", {hour: "numeric", minute: "numeric", hour12: config.time12Hours});
    try {
        //Centered Time
        if (config.centerTime) {
            timeString = `⠀⠀⠀⠀⠀⠀⠀⠀⠀ ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀ ⠀⠀⠀⠀⠀⠀ ${time}`;
        } else {
            timeString = time;
        }

        //POST request
        var headers = {
            "Content-Type": "application/x-www-form-urlencoded",
            "Cookie": cookies
        };
        var options = {
            url: `https://steamcommunity.com/profiles/${ownSteamID}/edit`,
            method: "POST",
            headers: headers,
            body: config.profileData.replace("SESID", sessionID).replace("TIMEHERE", timeString),
            gzip: true
        };                                          
        request(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                if (JSON.parse(body).success == "1") {
                    console.log(colors.green, `[${time}] Showcase updated.`);
                } else {
                    console.log(colors.red, `[${time}] Failed to update showcase. Please check your profileData.`);
                }
            } else {
                if (response.statusCode == 302) {
                    console.log(colors.yellow, `Steam session has expired. Relogging...`);
                    try {clearInterval(updateInterval)} catch(e){};
                    try {clearTimeout(updateTimeout)} catch(e){};
                    client.webLogOn();
                } else {
                    console.log(colors.red, `[${time}] Failed to load showcase status. Status code: ${response.statusCode}`);
                }
            }
        });
    } catch(e){console.log(colors.red, `An error occured: ${e}`);}
}
