# discuit-ts

discuit-ts is a TypeScript library for interacting with the discuit api.

## installation

discuit-ts is available on both [npm] and [the javascript registry][jsr].

if you want to install it via npm, you can run the following command:
```bash
npm install discuit-ts
```

if you want to install it via the jsr, you can run the following command:
```bash
npx jsr add discuit-ts
```
or check out the [jsr documentation][jsr-add] for more information.


## usage

```typescript
import { DiscuitClient } from 'discuit-ts';

const client = new DiscuitClient({
	"baseURL": 'https://discuit.net',
});

await client.login('username', 'password');
// or
await client.loginWithSid('sid');
const post = await client.getPost('5ZiPe34m');
await post.upvote();
```

the documentation can be found [here][docs].

## license

discuit-ts is licensed under MIT, view [LICENSE](./LICENSE) for more
information.

[npm]: https://www.npmjs.com/package/discuit-ts
[jsr]: https://jsr.io/@ttaylor-st/discuit-ts
[jsr-add]: https://jsr.io/docs/using-packages#adding-a-package
[docs]: https://jsr.io/@ttaylor-st/discuit-ts/doc
