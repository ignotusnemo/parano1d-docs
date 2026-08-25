# Configuration

Core reads TOML configuration from:

```text
~/.parano1d/parano1d.toml
```

unless `--config` selects another file. A missing file is created atomically
with safe defaults. Malformed TOML fails startup; it is never silently
replaced.

## Complete file

```toml
[network]
listen = "0.0.0.0:9600"
seeds = []

[storage]
backend = "mdbx"
path = "~/.parano1d/data"

[rpc]
listen = "127.0.0.1:9601"

[mining]
enabled = false
miner_address = ""
```

Command-line values override their corresponding file values.

## Network

`network.listen` accepts `HOST:PORT` or a libp2p multiaddress. Bind
`0.0.0.0:9600` to accept public IPv4 connections.

`network.seeds` adds bootstrap peers. Accepted forms include:

```text
198.51.100.10:9600
seed.example.org:9600
/ip4/198.51.100.10/tcp/9600
dnsaddr:seed.example.org
```

Built-in DNS seeds are always available. Custom seeds supplement them.

The `--seed HOST:PORT` option is repeatable and appends to configured seeds.

## Storage

`storage.backend` is `mdbx` in production. The RAM backend is for tests and
does not provide durable node State.

`storage.path` contains the chain database, wallet artifacts, peer identity,
proof cache and snapshot staging. Do not point two running node processes at
the same directory.

The command-line `--data-dir` overrides this path.

## RPC

Keep RPC on:

```text
127.0.0.1:9601
```

The interface includes wallet submission and process control. It is not a
public explorer API with general authentication.

External-mining deployments can protect the entire RPC endpoint with
`--mining-key`. The bearer token does not encrypt transport. Use loopback, a
private network, an SSH tunnel or an authenticated TLS proxy when the worker
is remote.

## Mining

Process mode is authoritative:

```sh
parano1d --mode node
parano1d --mode miner
parano1d --mode extminer --mining-key TOKEN
```

The legacy `mining.enabled` field does not override `--mode`. An empty
`miner_address` uses the wallet's active address. `--miner-address` overrides
the configured payout for that process.

Use `--cpu-threads N` to limit the shared internal-mining CPU pool. It does not
apply to ordinary node mode or to the separate external worker.

## Logs

`--log` accepts filters such as `error`, `warn`, `info` and `debug`. Start with
`info`. Debug logging is useful during a bounded investigation but may be
substantially noisier.

Under systemd, output goes to the journal. The GUI redirects its private node
to `parano1d-node.log` in the selected data directory.

## Preflight

Validate CPU support without creating configuration, wallet or database files:

```sh
parano1d --check-hardware
```

The successful final line is `NODE READY`.
