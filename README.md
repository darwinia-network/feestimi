# Darwinia Msgport API

<img width="800" alt="ormp-fee" src="https://github.com/darwinia-network/darwinia-msgport-api/assets/1608576/c9a7018d-9f02-4d74-9529-8cbfa7034309">



## Run for dev

0. clone this repo to your local.
1. `yarn install`
2. create and config your local `.env` file.
3. `yarn run start:dev`

## API

### API-Key

To access the API, you need to provide a valid API-Key in the request header.
```
curl --header 'API-Key: xxx...' ...
```

### ORMP  

```
/ormp/fee?from_chain_id=421613&to_chain_id=43&gas_limit=300000&payload=0x12345678&to_address=0xf5C6825015280CdfD0b56903F9F8B5A2233476F5&from_address=0xf5C6825015280CdfD0b56903F9F8B5A2233476F5
```

* **from_chain_id**: evm chain id
* **from_address**: source dapp address
* **to_chain_id**: evm chain id
* **to_address**: target dapp address
* **payload**: message payload
* **gas_limit**: gas_limit of payload on target chain

## RESULT

```json
{
  "code": 0,
  "data": {
    "fee": "1000083726784000",
    "params": "0x00000000000000000000000000000000000000000000000000000000000493e0"
  }
}
```

* the first item is the fee in native token(in wei).  
* the second item is the `params string` which can be used as the last param in `msgport._send` contract function.

## ERRORs

```json
{
  "code": 1,
  "message": "..."
}
```

## TODOs

- [x] rpc url validation and correction checking.
- [ ] cache result for a while for better performance.
