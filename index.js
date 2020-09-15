//Libraries
const SteamUser = require('steam-user');
const SteamTotp = require('steam-totp');
const request = require('request');
const config = require('./config.json')
const client = new SteamUser();

//Account Credentials
const logOnOptions = {
  accountName: config.account.username,
  password: config.account.password,
  twoFactorCode: SteamTotp.generateAuthCode(config.account.sharedSecret),
  rememberPassword: true
};

console.log("\x1b[36m%s\x1b[0m", "Steam digital clock showcase\nMade by Tsukani/zyN\nMake sure to read through the documentation first to ensure everything is set up correctly!\n");
console.log("\x1b[33m%s\x1b[0m", `Using ${config.time12Hours ? "12" : "24"} hour ${config.centerTime ? "centered" : "non-centered"} time format.`);
if (config.timezoneOffset) console.log("\x1b[33m%s\x1b[0m", `Using a ${config.timezoneOffset} hour offset.`);

//Login
client.logOn(logOnOptions);
console.log("\x1b[35m%s\x1b[0m", "Attempting to login...");
client.on("loggedOn", () => {
  console.log("\x1b[32m%s\x1b[0m", "Successfully logged into Steam!");
});

//Login Error
client.on('error', function(e) {
    return console.log("\x1b[31m%s\x1b[0m", `Failed to login: ${e.toString()}`);
});

//Get webSession (sessionID & Cookies) and initiate main function
client.on("webSession", function(sessionID, cookies) {
    clock(sessionID, cookies);
    console.log("\x1b[32m%s\x1b[0m", "Successfully acquired sessionID and Cookies!");
    var now = new Date();
    var timeUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
    setTimeout(() => {
        clock(sessionID, cookies);
        setInterval(() => {
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
            url: `https://steamcommunity.com/profiles/${config.steamID64}/edit`,
            method: "POST",
            headers: headers,
            body: config.profileData.replace("SESID", sessionID).replace("TIMEHERE", timeString),
            gzip: true
        };                                          
        request(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                if (JSON.parse(body).success == "1") {
                    console.log("\x1b[32m%s\x1b[0m", `[${time}] Showcase updated.`);
                } else {
                    console.log("\x1b[31m%s\x1b[0m", `[${time}] Failed to update showcase. Please check your profileData.`);
                }
            } else {
                console.log("\x1b[31m%s\x1b[0m", `[${time}] Failed to load showcase status. Status code: ${response.statusCode}`);
                if (steamResponse.statusCode == 302) {
                  console.log(colors.yellow, `Steam session has expired. Relogging...`);
                  clearInterval(updateInterval);
                  return client.relog();
                }
            }
        });
    } catch(e){console.log("\x1b[36m%s\x1b[0m", `An error occured: ${e}`);}
}
