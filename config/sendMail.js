import nodemailer from "nodemailer";
import { google } from "googleapis"
const { OAuth2 } = google.auth;
const OAUTH_PLAYGROUND = "https://developers.google.com/oauthplayground";
import dotenv from 'dotenv'

dotenv.config()

const { G_CLIENT_ID, G_CLIENT_SECRET, G_REFRESH_TOKEN, ADMIN_EMAIL } = process.env;         //get data from .env

const oauth2client = new OAuth2(                                                            //create new OAuth with data
  G_CLIENT_ID,
  G_CLIENT_SECRET,
  G_REFRESH_TOKEN,
  OAUTH_PLAYGROUND
);

const sendEmailReset = (to, url, text, name) => {                                           //send email with params for receiver mail, reset link, text, and receiver name
  oauth2client.setCredentials({
    refresh_token: G_REFRESH_TOKEN,
  });
  const accessToken = oauth2client.getAccessToken();
  const smtpTransport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: ADMIN_EMAIL,
      clientId: G_CLIENT_ID,
      clientSecret: G_CLIENT_SECRET,
      refreshToken: G_REFRESH_TOKEN,
      accessToken,
    },
  });

  const mailOptions = {
    from: ADMIN_EMAIL,
    to: to,
    subject: "RESET PASSWORD",
    html: `
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link
        href="https://fonts.googleapis.com/css2?family=Roboto:wght@300&display=swap"
        rel="stylesheet"
      />
      <title>Passioncorners | Account Activation</title>
      <style>
        .body {
          background-color: #fff;
          height: 100vh;
          font-family: "Roboto", sans-serif;
          color: #000;
          position: relative;
        }

        .container {
          max-width: 700px;
          width: 100%;
          height: 100%;
        }
        .wrapper {
          padding: 0 15px;
        }
        .card {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 100%;
        }
        span {
          color: #A285D5;
        }
        button {
          padding: 1em 6em;
          border-radius: 5px;
          border: 0;
          background-color: #A285D5;
          transition: all 0.3s ease-in;
          cursor: pointer;
        }
        button:hover {
          background-color: #263238;
          transition: all 0.3s ease-in;
          color: #fff;
        }
        .spacing {
          margin-top: 3rem;
        }
      </style>
    </head>
    <body class="body">
      <div class="container">
        <div class="wrapper">
          <div class="card">
            <h1 class="h1"><span>Hey</span> ${name}</h1>
            <p>Please click the button below to reset your password.</p>
            <a href=${url}><button>${text}</button></a>
            <p class="spacing">
              If the button above does not work, please navigate to the link
              provided below.
            </p>
            <div>${url}</div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `,
  };

  smtpTransport.sendMail(mailOptions, (err, info) => {
    if (err) return { err };
    return info;
  });
};

export default sendEmailReset;