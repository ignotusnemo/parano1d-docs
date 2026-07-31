# Networking

ParanO(1)d uses libp2p for peer identity, discovery, relay and synchronization.
The public network protocol is identified as:

```text
/noid/mainnet/1.0.0
```

The default P2P listener is TCP `9400`. JSON-RPC is a separate local
administration interface on `127.0.0.1:9401`.

## Peer identity and consensus identity

Each node persists a libp2p Ed25519 peer identity. It authenticates network
sessions and gives the peer a stable ID across restart.

That identity has no consensus authority. It cannot spend a UTXO, sign a block
or influence proof verification. Wallet ownership, block validity and proof of
work use the binary consensus stack instead.

## Discovery

Nodes combine three discovery sources:

- built-in DNS seeds for initial public peers;
- Kademlia for ongoing peer discovery;
- mDNS for peers on the local network.

Successful peer addresses are persisted and reused. The peer store keeps up to
500 peers and limits the number of remembered addresses for any one peer.

DNS records point to network endpoints, not chain state. Changing software or
resetting a node does not require changing its DNS name if the public address
remains the same.

## Gossip

GossipSub carries transaction intents and block announcements.

A complete atomic block bundle is sent inline when it fits below the inline
limit. Larger blocks are announced by header and pulled through a typed
request-response exchange. Gossip messages have a strict maximum size so a
peer cannot turn ordinary relay into unbounded allocation.

A transaction is relayed only after local mempool admission has verified its
canonical structure, authorization and current conflicts. Receiving gossip is
never equivalent to accepting consensus state.

## Request-response protocols

Typed exchanges serve:

- header batches;
- complete retained blocks;
- snapshot manifests and state segments;
- recent mempool inventory and missing intents.

Header batches contain at most 512 headers. Snapshot state is transferred as a
manifest followed by individually authenticated segments rather than as one
unbounded message.

When a peer connects, nodes can reconcile recent mempool contents. Every
received intent still passes ordinary local admission.

## Resource boundaries

Public networking is bounded at multiple layers:

- response byte budgets apply independently to inbound and outbound service;
- block and gossip message sizes are capped;
- state is segmented;
- peer addresses and peer-store entries are bounded;
- repeated invalid behavior is penalized;
- connection diversity is enforced by network group.

Outbound selection permits no more than two peers from one network group.
Inbound service permits at most eight connections from one IP address and 32
from one group. These limits reduce the value of filling all peer slots from
one hosting range.

They are not a substitute for a diverse public topology. Seed and mining
infrastructure should span independent networks and operators.

## Mining peer gate

Ordinary mining requires two authenticated peers. This prevents an unattended
node from extending an isolated private view merely because its network link
failed.

The gate is operational, not a vote. Peers do not approve the block and cannot
make an invalid transition acceptable. Once connected, the miner follows local
proof verification and cumulative-work consensus.

## Interface boundaries

P2P port `9400` is intended for public exposure. RPC port `9401` is not. RPC
includes wallet and process-control methods and has no public transport
authentication layer; keep it on loopback or behind an authenticated private
tunnel.

See [Configuration](../operate/configuration.md) for deployment settings and
[Synchronization](synchronization.md) for the data carried by sync protocols.
