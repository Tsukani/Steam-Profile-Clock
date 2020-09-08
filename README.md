# Steam Profile Clock
Allows you to add a digital clock to your Steam Community profile using a `Custom Info Box`.

## Requirements and recommendations
* [Node.js](https://nodejs.org/en/) is required to run the application. `Current` version is recommended.
* Your Steam account must be level 10 or higher.
* A server (VPS/RDP) is highly recommended but not required. Having the clock run 24/7 requires the application to be open at all times.
* The account's `sharedSecret` is highly recommended if the account uses Steam Mobile Authenticator. It is not required but makes sure that the clock will continue in case the session expires.
* The `profileData Script` which can be found [here](https://github.com/Tsukani/Steam-Profile-Clock#profiledata-script).

## Installation
1. Download the application [here](https://github.com/Tsukani/Steam-Profile-Clock/archive/master.zip) and extract it to a folder
2. Open a command prompt inside the folder
3. Type the following command `npm i`
4. Open the config.json file and fill it out
* account:
  * username: The username of the account you are using
  * password: The password of the account you are using
  * sharedSecret: A string of letters, symbols and numbers that generate Steam Guard codes for you. Not required but highly recommended.
* profileData: The string you acquired from the profileData ([here](https://github.com/Tsukani/Steam-Profile-Clock#profiledata-script))
* steamID64: The steamID64 of your account. You can find it on [steamid.io](https://steamid.io)
* time12Hours: A boolean that decides if you want 24-hour (false) or 12-hour (true) time
* centerTime: A boolean that decides if you want non-centered (false) or centered (true) time
5. Lastly, type the following command to start the application `node .`

## profileData Script
To ensure that your profile will display the correct showcases a custom script is required to gather the showcase information on your profile.
1. Copy the script into your clipboard:

`function profileData() {$J("input[name='rgShowcaseConfig[8][0][title]']").val("TIMEHERE");formData = new FormData(document.querySelector('form'));var arr = [];for (var pair of formData.entries()) {arr.push(pair[0]+ '=' + pair[1]);}arr.push('type=showcases', 'sessionID=SESID', 'json=1');window.prompt("Replace profileData with the following data:\n(CTRL + A & CTRL + C)", arr.join("&").replace(/\r?\n/g, "\\n").replace(/"/g, '\\"'));}$J(".profileedit_SaveCancelButtons_2KJ8a").append('<button type="button" class="DialogButton _DialogLayout Primary" onclick="profileData()">Copy profileData</button>');`

2. Visit the Featured Showcase edit page of your profile in a web browser ([here](https://steamcommunity.com/my/edit/showcases))
3. Open the developer console
    * `CTRL + Shift + J` for most browsers
    * `CTRL + Shift + K` for FireFox (Typing allow pasting is required to paste)
4. Paste the entire script into the console and hit `enter`
5. Next to the Save and Cancel button a new button titled `Copy profileData` should appear. Once you are happy with your showcases (MUST INCLUDE A CUSTOM INFO BOX) press the new button
6. A dialog box should appear. Copy the contents of it and paste it into your config file on the `profileData` line between the quotation marks

(You are required to follow these steps if you wish to update your profile while running this script since it will automatically reset it back to the previous layout)
