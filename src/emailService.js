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

export async function doSend(req, to) {
  let mesg = await consMesg(req, to);
  const result = await transporter.sendMail(mesg);
  console.log("Message sent: %s", result.messageId);
}

export async function consMesg(req, to) {
  let data = JSON.parse(await getData(req.url));

  let mesg = {
    from: process.env.SENDER,
    to,
    subject: req.path,
    text: "This Email has been sent via ebooks-paperboy.",
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
