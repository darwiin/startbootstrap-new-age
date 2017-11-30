/**
 * Copyright 2015 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

const functions = require('firebase-functions');
const nodemailer = require('nodemailer');
const request = require('request-promise');
// Configure the email transport using the default SMTP transport and a GMail account.
// For Gmail, enable these:
// 1. https://www.google.com/settings/security/lesssecureapps
// 2. https://accounts.google.com/DisplayUnlockCaptcha
// For other types of transports such as Sendgrid see https://nodemailer.com/transports/
// TODO: Configure the `gmail.email` and `gmail.password` Google Cloud environment variables.
const gmailEmail = functions.config().gmail.email;
const gmailPassword = functions.config().gmail.password;
const mailTransport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: gmailEmail,
    pass: gmailPassword
  }
});

/**
 * Send an email.
 */
exports.email = functions.https.onRequest((req, res) => {
  console.log("EMAIL INVOCATION");
  const form = req.body;

  return newReCaptchaRequest(form["g-recaptcha-response"])
    .then(result => {
      console.log("recaptcha result", result)
      if (result.success) {
        const content = `Prénom: ${form.name}\nNom: ${form.surname}\nemail: ${form.email}\nTéléphone: ${form.phone}\n\n${form.message}`;

        const mailOptions = {
          from: `${form.name} ${form.surname} <${form.email}>`,
          to: "simplycity.epi@engie.com",
          subject: "Message from Simply City website",
          text: content
        };

        console.log(mailOptions);

        return mailTransport.sendMail(mailOptions)
          .then(() => {
            res.json({
              type: "success",
              message: "Votre message a bien été envoyé."
            });
            res.sendStatus(200);
            console.log('Email sent');
          });
      }
      else {
        res.send("Recaptcha verification failed. Are you a robot?")
      }
    })
    .catch(reason => {
      console.log("Recaptcha request failure", reason)
      res.send("Recaptcha request failed.")
    })
});

function newReCaptchaRequest(gRecaptchaResponse) {
  return request({
    uri: 'https://recaptcha.google.com/recaptcha/api/siteverify',
    method: 'POST',
    formData: {
      secret: '6Lc_njgUAAAAAB_OC6ztOoMEk1SuedE6inodsr7j',
      response: gRecaptchaResponse
    },
    json: true
  });
}