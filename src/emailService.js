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
  try {
    let mesg = await consMesg(req);
    if (process.env.SEND_EMAIL === "false") {
      mesg.attachments = !!mesg.attachments;
      logger.info(
        `Environment variable SEND_EMAIL is false, pass email sending`,
        mesg
      );
    } else {
      const result = await transporter.sendMail(mesg);
      logger.info(`Message sent: ${result.messageId}`);
    }
  } catch (err) {
    logger.error("Send email failed.", err);
    return false;
  }
  return true;
}

export async function consMesg(req) {
  let data = await doFetch(req.url);
  let title = beautifyTitle(req.path);

  let mesg = {
    from: process.env.SENDER,
    to: req.to,
    subject: title,
    text: "This Email has been sent via ebooks-paperboy.",
    attachments: [
      {
        filename: title,
        content: data.content,
        encoding: "base64",
      },
    ],
  };

  return mesg;
}

// new_yorker.2023.02.06.epub -> The New Yorker 6 Feb 2023.epub
// TheEconomist.2023.03.04.epub -> The Economist 4 Mar 2023.epub
// Atlantic_2022.01.02.epub -> The Atlantic 2 Jan 2022.epub
// wired_2024.06.02.epub -> Wired Magazine 2 Jun 2024.epub
export function beautifyTitle(title) {
  let dateStr;
  let titleStr;
  if (title.startsWith("new_yorker")) {
    titleStr = "The New Yorker";
    dateStr = title.substring(title.indexOf(".") + 1).replace(".epub", "");
  } else if (title.startsWith("TheEconomist")) {
    titleStr = "The Economist";
    dateStr = title.substring(title.indexOf(".") + 1).replace(".epub", "");
  } else if (title.startsWith("Atlantic")) {
    titleStr = "The Atlantic";
    dateStr = title.substring(title.indexOf("_") + 1).replace(".epub", "");
  } else if (title.startsWith("wired")) {
    titleStr = "Wired Magazine";
    dateStr = title.substring(title.indexOf("_") + 1).replace(".epub", "");
  } else {
    throw new Error("Unknown title format");
  }
  let parsedDate = parseDateStr(dateStr);
  return titleStr + " " + parsedDate + ".epub";
}

// 2023.02.06 -> 6 Feb 2023
export function parseDateStr(dateStr) {
  let date = new Date(dateStr);
  let day = date.getDate();
  let month = date.toLocaleString("default", { month: "short" });
  let year = date.getFullYear();
  return `${day} ${month} ${year}`;
}