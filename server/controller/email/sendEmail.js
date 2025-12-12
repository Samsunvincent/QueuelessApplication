"use strict";
const nodemailer = require("nodemailer");
const dotenv = require('dotenv');
dotenv.config();

exports.sendEmail = async function (emails, subject, content) {
  return new Promise(async (resolve, reject) => {
    try {

      // Convert array to comma-separated string
      if (typeof emails === "object") emails = emails.join(", ");

      // Create email transporter
      let transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: Number(process.env.EMAIL_PORT) === 465, 
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      // Send email
      let info = await transporter.sendMail({
        from: `"Pomograd" <${process.env.EMAIL_USER}>`,
        to: emails,
        subject: subject,
        html: content,
      });

      resolve(true);

    } catch (error) {
      console.log("Email error:", error);
      reject(false);
    }
  });
};
