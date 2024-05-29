import { get } from "https";
import { parse } from "url";

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
