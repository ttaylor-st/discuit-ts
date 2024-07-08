# discuit-ts

discuit-ts is a TypeScript library for interacting with the discuit api.

## installation

```bash
npm install @ttaylor-st/discuit-ts
```


## usage

```typescript
import { DiscuitClient } from 'discuit-ts';

const client = new DiscuitClient({
	"baseURL": 'https://discuit.net',
});

const post = await client.getPost('5ZiPe34m');
await post.upvote();
```

## license

discuit-ts is licensed under MIT, view [LICENSE](./LICENSE) for more
information.
