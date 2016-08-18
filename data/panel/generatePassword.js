/*
 * This Source Code is subject to the terms of the Mozilla Public License
 * version 2.0 (the "License"). You can obtain a copy of the License at
 * http://mozilla.org/MPL/2.0/.
 */

"use strict";

let {port} = require("platform");
let {passwords} = require("../proxy");
let {setSubmitHandler, setResetHandler} = require("./events");
let {setValidator, markInvalid, enforceValue} = require("./formValidation");
let state = require("./state");
let {$, setActivePanel, showUnknownError, messages} = require("./utils");

$("password-length").addEventListener("input", updatePasswordLengthDisplay);
$("generate-password").addEventListener("reset", () =>
{
  setTimeout(updatePasswordLengthDisplay, 0);
});
updatePasswordLengthDisplay();

setValidator("generate-password-user-name", enforceValue.bind(null, "user-name-required"));
setValidator(["charset-lower", "charset-upper", "charset-number", "charset-symbol"], validateCharsets);

setSubmitHandler("generate-password", addGeneratedPassword);
setResetHandler("generate-password", () => setActivePanel("password-list"));

state.on("update", updateSite);
updateSite();

function updateSite()
{
  $("generate-password-site").textContent = state.site;
}

function updatePasswordLengthDisplay()
{
  $("password-length-value").textContent = $("password-length").value;
}

function validateCharsets(element1, element2, element3, element4)
{
  if (!element1.checked && !element2.checked && !element3.checked && !element4.checked)
    return messages["no-characters-selected"];

  return null;
}

function addGeneratedPassword()
{
  passwords.addGenerated({
    site: state.site,
    name: $("generate-password-user-name").value,
    length: $("password-length").value,
    lower: $("charset-lower").checked,
    upper: $("charset-upper").checked,
    number: $("charset-number").checked,
    symbol: $("charset-symbol").checked
  }).then(pwdList =>
  {
    state.set({pwdList});
    setActivePanel("password-list");
  }).catch(error =>
  {
    if (error == "alreadyExists")
      markInvalid("generate-password-user-name", messages["user-name-exists"]);
    else
      showUnknownError(error);
  });
}
