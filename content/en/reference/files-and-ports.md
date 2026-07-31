# Files, ports and limits

## Default paths

| Path | Purpose | Authority |
|---|---|---|
| `~/.parano1d/parano1d.toml` | Core configuration | Operator |
| `~/.parano1d/gui-settings.json` | GUI preferences | Local UI |
| `~/.parano1d/data/` | Default Core and GUI node data | Consensus state |
| `DATA_DIR/wallet.key` | 256-bit wallet master secret | Spending authority |
| `DATA_DIR/wallet.receipts` | Saved outgoing receipts | Local payment evidence |
| `DATA_DIR/wallet.history` | Local wallet history | Local presentation |
| `DATA_DIR/p2p_identity.key` | Stable libp2p Ed25519 identity | Network identity only |
| `DATA_DIR/peers.json` | Successful public outbound peers | Discovery hint |
| `DATA_DIR/history-step-cache/` | Derived local proof-matrix cache | Rebuildable |
| `DATA_DIR/snapshot-staging/` | Incoming snapshot scratch data | Never canonical |
| `DATA_DIR/parano1d-gui.toml` | GUI-owned node configuration | Private node |
| `DATA_DIR/parano1d-node.log` | GUI-owned node log | Diagnostics |

On Windows, `~` means the user profile directory.

`wallet.key` and `p2p_identity.key` are owner-only files on Unix. The first
controls funds; the second does not.

## Ports

| Port | Bind | Use | Public |
|---:|---|---|---|
| TCP 9400 | `0.0.0.0` | libp2p | Yes |
| TCP 9401 | `127.0.0.1` | JSON-RPC | No |

Remote external mining may use RPC only through a protected private or TLS
transport. A bearer token authenticates requests but does not encrypt them.

## Network identity

| Item | Value |
|---|---|
| Network magic | `NOID` |
| libp2p protocol | `/noid/mainnet/1.0.0` |
| Transaction and block gossip | GossipSub |
| Discovery | DNS seeds, Kademlia, mDNS |

## Retention

| Data | Window |
|---|---:|
| Headers | Permanent |
| Complete accepted blocks | 18 |
| Reorganizable suffix | 18 |
| Maximum reorganization | 17 |
| Undo records | 36 |
| Transaction epoch | 144 |

Receipts preserve payment-specific inclusion evidence outside body retention.

## Local resource limits

| Resource | Limit |
|---|---:|
| Mempool logical transactions | 1,024 |
| Mempool intent bytes | 384 MiB |
| Peer-store entries | 500 |
| Addresses per stored peer | 8 |
| Startup peer anchors | 8 |
| Public outbound peers per network group | 2 |
| Public inbound peers per IP | 8 |
| Public inbound peers per network group | 32 |
| Header batch | 512 |
| Simultaneous snapshot exports | 2 |
| Pending state-segment requests | 64 |
| External template lifetime | 30 seconds |

## RPC bounds

| Operation | Bound |
|---|---:|
| State atlas | 256 buckets |
| Slot hints returned | 256 |
| Recent-transaction page | 32 rows |
| Receipt page | 50 rows |
| Mined-block page | 50 rows |
| Imported address discovery | 20 candidates |
| Interactive consolidation | 64 inputs |
