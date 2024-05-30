import { findLatestNode } from "./dataService.js";
import { doSend } from "./emailService.js";

// TODO
const BOOKS = process.env.BOOKS.split(",");

export async function checkBooksAndSend() {
  for (const bookName of BOOKS) {
    let bookInfo = await findLatestNode(bookName);
    console.log(`Got book info for bookName: ${bookName}, ${JSON.stringify(bookInfo)}`);

    let receiver = process.env.RECEIVER;
    await doSend(bookInfo, receiver);
    console.log(`Sent book ${bookName} to ${receiver}`);
  }

  console.log("Check new books finished.");
}
