# External miner

External mining separates PoW nonce search from the node. The node still owns
the mempool, transaction selection, State transition, `HistoryStep` proof,
template and block relay.

The worker receives no block body or proving witness.

## Local worker

Start the node in external-miner mode with a bearer token:

```sh
parano1d --mode extminer --mining-key 'LONG-RANDOM-TOKEN'
```

In another terminal:

```sh
parano1d-miner \
  --rpc http://127.0.0.1:9601 \
  --key 'LONG-RANDOM-TOKEN'
```

The token is required even on loopback when the node was started with
`--mining-key`.

Limit worker threads when needed:

```sh
parano1d-miner --key 'LONG-RANDOM-TOKEN' --threads 8
```

## Remote worker

Do not expose an unencrypted bearer token and general RPC interface directly
to the Internet.

Place the worker and node on an authenticated private network, or terminate TLS
and restrict the exposed path at a reverse proxy. Bind public RPC only after
that transport is in place:

```sh
parano1d \
  --mode extminer \
  --rpc-listen 0.0.0.0:9601 \
  --mining-key 'LONG-RANDOM-TOKEN'
```

Firewall the port so only intended workers or the proxy can reach it.

## Payout

By default, templates use the node's configured payout address. This is the
safer solo-mining mode.

To let a worker request its own payout, the node operator must opt in:

```sh
parano1d \
  --mode extminer \
  --mining-key 'LONG-RANDOM-TOKEN' \
  --allow-custom-coinbase
```

The worker can then use:

```sh
parano1d-miner \
  --key 'LONG-RANDOM-TOKEN' \
  --coinbase o1...
```

Custom coinbase changes only the payout embedded before proof construction.
The worker still cannot modify the proved template.

## Template lifecycle

`getBlockTemplate` returns an opaque single-use ID, 16-field PoW schedule,
nonce index and target. The worker searches random, independent nonce ranges
and calls `submitBlock` with exactly 16 little-endian nonce bytes.

A template expires after 30 seconds. It is also invalidated by a canonical tip
change, successful submission or node-side cancellation. A stale result is
normal and the worker requests another template after its poll interval.

## Diagnose

Run:

```sh
parano1d-miner --check-hardware
```

If requests fail:

- `401 Unauthorized` means the token is absent or does not match;
- a custom coinbase error means the node did not enable it;
- repeated stale templates usually mean the node is receiving new tips or
  proof preparation exceeds the template lifecycle;
- no template means the node is not synchronized, lacks the peer quorum or is
  not in `extminer` mode.
