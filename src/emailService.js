import { createTransport } from "nodemailer";
import { doFetch } from "./dataService.js";
import logger from "./logger.js";

const transporter = createTransport({
  host: process.env.SMTP_HOST || "smtp.163.com",
  port: process.env.SMTP_PORT || 465,
  secure: !process.env.SMTP_PORT || process.env.SMTP_PORT == 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/* 
{
    "path": "new_yorker.2024.05.27.epub",
    "mode": "100644",
    "type": "blob",
    "sha": "bc9972025c68b119659bd2e9d8daa0ad6532e448",
    "size": 7825176,
    "url": "https://api.github.com/repos/hehonghui/awesome-english-ebooks/git/blobs/bc9972025c68b119659bd2e9d8daa0ad6532e448",
    "to": "example@gg.com"
}
*/
export async function doSend(req) {
  let mesg = await consMesg(req);
  const result = await transporter.sendMail(mesg);
  logger.info(`Message sent: ${result.messageId}`);
}

export async function consMesg(req) {
  let data = await doFetch(req.url);

  let mesg = {
    from: process.env.SENDER,
    to: req.to,
    subject: req.path, // TODO generate subject
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
