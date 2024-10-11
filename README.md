# ebooks-paperboy
This repo periodically checks the [awesome-english-ebooks](https://github.com/hehonghui/awesome-english-ebooks). If a magazine is avaiable, it sends it to the email you specified.

## Get started
Fork this repo, set the following *Repository variables* and *Repository secrets*
Repository variables:
- BOOKS: a list of strings containing name of the books you want to check. For example, `'01_economist,02_new_yorker,04_atlantic,05_wired'`. These names correspond to folder names of the awesome-english-ebooks repo
- EMAIL_USER: the username of the email used to send the books. For example, `exampleuse@xxx.com`
- RECEIVER: the email where you want to receive the books. If it's a Kindle email, you need to approve the `EMAIL_USER`. Refer to [Send to Kindle for Email](https://www.amazon.com/sendtokindle/email)
- SENDER: the display name for the email sender. For example, `'"EBOOKS_WORKER" <skycc716@163.com>'`

Repository variables:
- EMAIL_PASS: the password for `EMAIL_USER`
- KV_ACCOUNT_ID: Cloudflare account id used to access Cloudflare KV. See [Find account ID](https://developers.cloudflare.com/fundamentals/setup/find-account-and-zone-ids/#find-account-id-workers-and-pages) for detail
- KV_NAMESPACE_ID: you can find it on Cloudflare KV dashboard, if there isn't one, you need to create a new namespace first. See [Cloudflare Workers KV](https://developers.cloudflare.com/kv/) for instructions
- KV_TOKEN: the Bearer token used to access Cloudflare KV API. See [Create API token](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/) for guidance

Then enable action for this repo and enjoy your reading!
