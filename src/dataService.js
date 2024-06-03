const REPO_MASTER =
  "https://api.github.com/repos/hehonghui/awesome-english-ebooks/git/trees/master";
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36";

export async function doFetch(url) {
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
  let master = await doFetch(REPO_MASTER);
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

  let books = await doFetch(rootTree[0].url);
  let bookTree = books.tree;
  // match te_2023.05.06 or 2023.05.06
  bookTree = bookTree.filter((e) => {
    return e.type == "tree" && /^.*_*\d{4}\.\d{2}\.\d{2}$/.test(e.path);
  });
  bookTree.sort((a, b) => {
    return b.path.localeCompare(a.path);
  });

  let book = await doFetch(bookTree[0].url);
  let fileTree = book.tree;
  fileTree = fileTree.filter((e) => {
    return e.type == "blob" && e.path.includes(".epub");
  });

  return fileTree[0];
}

// https://api.cloudflare.com/client/v4/accounts/{account_id}/storage/kv/namespaces/{namespace_id}/values/{key_name}
export async function read(key) {
  let headers = construstHeaders();
  let response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${process.env.KV_ACCOUNT_ID}/storage/kv/namespaces/${process.env.KV_NAMESPACE_ID}/values/${key}`,
    {
      headers,
    }
  );
  if (!response.ok && response.status != 404) {
    let reason = await response.text();
    throw new Error(`Failed to read key: ${key}, reason: ${reason}`);
  }
  return await response.json();
}

export async function write(key, value) {
  let headers = construstHeaders();
  let response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${process.env.KV_ACCOUNT_ID}/storage/kv/namespaces/${process.env.KV_NAMESPACE_ID}/values/${key}`,
    {
      method: "put",
      headers,
      body: JSON.stringify(value),
    }
  );
  if (!response.ok) {
    let reason = await response.text();
    throw new Error(`Failed to write key: ${key}, reason: ${reason}`);
  }
  return await response.json();
}

function construstHeaders() {
  let headers = new Headers();
  headers.append("User-Agent", USER_AGENT);
  headers.append("Content-Type", "application/json");
  headers.append("Authorization", `Bearer ${process.env.KV_TOKEN}`);
  return headers;
}
