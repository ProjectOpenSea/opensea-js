### Summary

- Add integration: fulfill best listing using `BUY_LISTING_*` envs; asserts success, emits events, no failures; fills only 1 unit (`unitsToFill: 1`) even if listing has 10k quantity.
- SDK fixes: ethers v6-compatible tx hash handling; add optional `unitsToFill` to `fulfillOrder`; fix ERC1155 transfer `data` to `0x`.
- Test setup refactor: unify `ALCHEMY_API_KEY`; move env, providers, and shared SDK/API clients to `test/utils/{env,providers,sdk}.ts`.
- Docs: update integration test README with new env vars.
- Repo hygiene: ignore `.claude/settings.local.json`.

### Details

- New test: `test/integration/fulfillBestListing.spec.ts` uses `getBestListing` + `fulfillOrder` and verifies `TransactionConfirmed` and no `TransactionFailed`.
- `fulfillOrder` supports `unitsToFill` and passes it to Seaport.
- Handle `executeAllActions()` result as `string | ContractTransactionResponse` for ethers v6.
- ERC1155 `safeTransferFrom` now uses `data: "0x"` to satisfy BytesLike requirements.

### Env

- Requires: `OPENSEA_API_KEY`, `ALCHEMY_API_KEY`, `WALLET_PRIV_KEY`, `BUY_LISTING_CHAIN`, `BUY_LISTING_CONTRACT_ADDRESS`, `BUY_LISTING_TOKEN_ID` (optional `BUY_LISTING_RPC_URL`).

### How to run

```bash
npm run test:integration -- test/integration/fulfillBestListing.spec.ts
# or
npm run test:integration -- --grep "SDK: fulfill best listing"
```
