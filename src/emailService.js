import { createTransport } from "nodemailer";
import { getData } from "./dataService.js";

const transporter = createTransport({
  host: process.env.SMTP_HOST || "smtp.163.com",
  port: process.env.SMTP_PORT || 465,
  secure: !process.env.SMTP_PORT || process.env.SMTP_PORT == 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function doSend(req) {
  let mesg = await consMesg(req);
  const result = await transporter.sendMail(mesg);
  console.log("Message sent: %s", result.messageId);
}

export async function consMesg(req) {
  let data = JSON.parse(await getData(req.url));

  let mesg = {
    from: process.env.SENDER,
    to: req.to,
    subject: req.path,
    attachments: [
      {
        filename: req.path,
        content: data.content,
        encoding: "base64",
      },
    ],
  };

  return mesg;
}
