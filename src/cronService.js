import { findLatestNode, getBookInfoFromCache, setBookInfoToCache } from "./dataService.js";
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

    let to = process.env.RECEIVER;
    let existBookInfo = await getBookInfoFromCache(bookName, to);
    if (bookInfo.sha === existBookInfo.sha) {
      logger.info(`Book ${bookName}, path ${bookInfo.path} is already sent.`);
      continue;
    }

    let success = await doSend({
      ...bookInfo,
      to,
    });
    if (!success) {
      logger.error(`Failed to send book ${bookName} to ${to}`);
      return;
    }
    console.log(`Sent book ${bookName} to ${to}`);
    await setBookInfoToCache(bookName, to, bookInfo);
  }

  logger.info("Check new books finished.");
}
