import { findLatestNode, write, read } from "./dataService.js";
import { doSend } from "./emailService.js";
import logger from "./logger.js";

// TODO
const BOOKS = process.env.BOOKS.split(",");

export async function checkBooksAndSend() {
  for (const bookName of BOOKS) {
    let bookInfo = await findLatestNode(bookName);
    logger.info(
      `Got book info for bookName: ${bookName}, ${JSON.stringify(bookInfo)}`
    );

    let existBookInfo = await read(bookName);
    if (bookInfo.sha === existBookInfo.sha) {
      logger.info(`Book ${bookName}, path ${bookInfo.path} is already sent.`);
      continue;
    }

    let to = process.env.RECEIVER;
    let success = await doSend({
      ...bookInfo,
      to,
    });
    if (!success) {
      logger.error(`Failed to send book ${bookName} to ${to}`);
      return;
    }
    console.log(`Sent book ${bookName} to ${to}`);
    await write(bookName, bookInfo);
  }

  logger.info("Check new books finished.");
}
