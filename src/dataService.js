import { get } from "https";
import { parse } from "url";

const REPO_MASTER =
  "https://api.github.com/repos/hehonghui/awesome-english-ebooks/git/trees/master";
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36";

export function getData(urlStr) {
  return new Promise((resolve, reject) => {
    let parsedUrl = parse(urlStr, true);
    const options = {
      host: parsedUrl.hostname,
      path: parsedUrl.pathname,
      port: parsedUrl.port,
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
      },
    };

    let request = get(options, (res) => {
      if (res.statusCode !== 200) {
        console.error(
          `Did not get an OK from the server. Code: ${res.statusCode}`
        );
        res.resume();
        return;
      }
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        console.log(`Retrieved all data, length: ${data.length}`);
        resolve(data);
      });
    });

    request.on("error", (err) => {
      console.error(err);
      reject(err);
    });
  });
}

async function fetchJson(url) {
  let headers = new Headers();
  headers.append("User-Agent", USER_AGENT);

  let response = await fetch(url, {
    headers: headers,
  });

  if (!response.ok) {
    let reason = await response.text();
    throw new Error(`Failed to fetch json from url: ${url}, reason: ${reason}`);
  }
  return await response.json();
}

export async function findLatestNode(bookName) {
  let master = await fetchJson(REPO_MASTER);
  let rootTree = master.tree;
  if (!rootTree) {
    throw new Error("Failed to fetch GitHub repository master tree");
  }
  if (rootTree.length <= 0) {
    throw new Error("The master tree has no content");
  }
  rootTree = rootTree.filter((e) => {
    return e.path == bookName && e.type == "tree";
  });

  let books = await fetchJson(rootTree[0].url);
  let bookTree = books.tree;
  // match te_2023.05.06 or 2023.05.06
  bookTree = bookTree.filter((e) => {
    return e.type == "tree" && /^.*_*\d{4}\.\d{2}\.\d{2}$/.test(e.path);
  });
  bookTree.sort((a, b) => {
    return b.path.localeCompare(a.path);
  });

  let book = await fetchJson(bookTree[0].url);
  let fileTree = book.tree;
  fileTree = fileTree.filter((e) => {
    return e.type == "blob" && e.path.includes(".epub");
  });

  return fileTree[0];
}
