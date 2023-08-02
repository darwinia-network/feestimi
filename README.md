# feestimi

issue for the [spec](https://github.com/darwinia-network/darwinia-msgport/issues/66).

## Run for dev

0. clone this repo to your local.
1. `npm install`
2. create and config your local `.env` file.
2. `npm run start:dev`

```bash
curl 'http://localhost:3001/layerzero/estimate_fee?from_chain_id=97&to_chain_id=1287&gas_limit=300000&payload=0x12345678'
curl 'http://localhost:3001/axelar/estimate_fee?from_chain_id=97&to_chain_id=1287&gas_limit=300000'
curl 'http://localhost:3001/axelar-testnet/estimate_fee?from_chain_id=97&to_chain_id=1287&gas_limit=300000'
```

## RESULT

```json
{
  "code": 0,
  "data": "1239546427527472"
}
```
Native gas tokens in wei


## ERRORs

FeestimiError
```json
{
  "code": 1,
  "message": "..."
}
```

MessagingLayerError
```json
{
  "code": 2,
  "message": "..."
}
```

## TODOs
- [x] rpc url validation and correction checking.  
- [ ] cache result for several minutes for better performance.  
- [ ] axelar chain id automation.  
