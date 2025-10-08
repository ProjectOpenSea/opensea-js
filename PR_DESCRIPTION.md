### PR Summary

- New integration: `fulfillBestListing` via `BUY_LISTING_*`; fulfills 1 unit; asserts success and events.
- SDK: ethers v6 tx hash handling; optional `unitsToFill` in `fulfillOrder`; ERC1155 `data` -> `0x`.
- Tests: unify `ALCHEMY_API_KEY`; move env/providers/sdk to `test/utils/{env,providers,sdk}.ts`.
- Docs: update integration README; ignore `.claude/settings.local.json`.

### Run

```bash
npm run test:integration -- test/integration/fulfillBestListing.spec.ts
# or
npm run test:integration -- --grep "SDK: fulfill best listing"
```
