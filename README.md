# feestimi

issue for the [spec](https://github.com/darwinia-network/darwinia-msgport/issues/66).

## Run for dev

0. clone this repo to your local.
1. `npm install`
2. create and config your local `.env` file.
3. `npm run start:dev`

## API

* /:platform/estimate_fee
  ```bash
  curl 'http://localhost:3389/layerzero/estimate_fee?from_chain_id=97&to_chain_id=1287&gas_limit=300000&payload=0x12345678'
  curl 'http://localhost:3389/axelar/estimate_fee?from_chain_id=97&to_chain_id=1287&gas_limit=300000'
  curl 'http://localhost:3389/axelar-testnet/estimate_fee?from_chain_id=97&to_chain_id=1287&gas_limit=300000'
  curl 'http://localhost:3389/celer/estimate_fee?from_chain_id=97&to_chain_id=81&gas_limit=300000&payload=0x12345678&from_address=0xf5C6825015280CdfD0b56903F9F8B5A2233476F5&to_address=0xf5C6825015280CdfD0b56903F9F8B5A2233476F5&extra=[[10, 1]]'
  ```
  Note 1: extra is an optional array for messaging layer specific params.  
  Note 2: celer is for test only. It has an extra param '[10, 1]' which is the src token price and dst token price ratio.

* /chains
  ```bash
  curl http://localhost:3389/chains
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
