import { findLatestNode } from "./dataService.js";
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
    await doSend({
      ...bookInfo,
      to,
    });
    console.log(`Sent book ${bookName} to ${to}`);
  }

  logger.info("Check new books finished.");
}
