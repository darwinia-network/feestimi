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

```json
{
  "code": 102,
  "message": "Chain ${_chainId}'s ${_lowLevel} id not found in ${_lowLevel} chain list"
}
```

```json
{
  "code": 103,
  "message": "Route from ${_fromChainId} to ${_toChainId} not found"
}
```

```json
{
  "code": 104,
  "message": "Chain ${_chainid} missing ${_what}"
}
```

```json
{
  "code": 105,
  "message": "Chain ${_chainId} not found in chain_mini.json"
}
```

```json
{
  "code": 106,
  "message": "Multiple ${_lowLevel} ids found for chain ${_chainId} in ${_lowLevel} chain list"
}
```

Unknown error
```json
{
  "code": 999,
  "message": "..."
}
```

Error from low-level messaging layer - Layerzero
```json
{
  "code": 1000,
  "message": "..."
}
```

Error from low-level messaging layer - axelar
```json
{
  "code": 2000,
  "message": "..."
}
```

## TODOs
- [x] rpc url validation and correction checking.  
- [ ] cache result for several minutes for better performance.  
- [ ] axelar chain id automation.  
