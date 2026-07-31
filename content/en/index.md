# ParanO(1)d

**A proof-native L1 statechain secured by proof of work.**

Blockchains have a fundamental architectural flaw: to validate the present,
you must replay the past. A new full node downloads the chain from genesis and
re-executes every transaction because the current state does not prove itself.
This is not a temporary limitation. It is built into the model.

ParanO(1)d removes that requirement.

Validity is established once, where the complete information already exists.
The wallet proves authorization with its private witness. The miner proves the
public transaction logic and the exact state transition. The network verifies
those proofs instead of repeating the same execution.

Every accepted block carries a recursive `HistoryStep` that binds the block,
its new UTXO root and the validity of the preceding statechain. A new node can
authenticate the current state and verify the recent reorg suffix without
executing the chain from genesis.

Once the present state carries its own proof, spent state can be deleted and
reused. Ownership no longer needs a public key or digital signature. State
growth can be priced directly. Proof of work can order transitions whose
validity is already established. The age of the network does not become a
hardware requirement.

## The fundamental shift

| | Conventional blockchain | ParanO(1)d |
|---|---|---|
| Validation | Every full node re-executes | The witness holder proves; the network verifies |
| Bootstrap | Rebuild state from genesis | Authenticate current state and verify the recent suffix |
| Ownership | Public-key signature | Fresh ZK proof of a Poseidon2b preimage |
| State | Derived from accumulated history | Exact live UTXO state is a consensus object |
| Spent outputs | Remain part of required history | Slots are cleared and safely reused |
| Proof of work | Orders an execution log | Orders proof-valid state transitions |
| Post-quantum migration | Replace the ownership scheme | No elliptic-curve transaction scheme to replace |

## One transition, proved once

When sending NOID, the wallet selects its UTXOs and creates one atomic
`PagedSpend`. It produces a freshly randomized, witness-hiding authorization
for `{logical_txid, input_owner}`. The 256-bit spending secret never leaves the
wallet.

The authorization is stateless: it contains no UTXO Merkle path and is not
tied to one state root. The miner holds the public state witness and proves
separately that every input exists, every output slot is empty, values balance,
fees are correct and the resulting state root is exact.

The mempool verifies a complete transaction intent before relaying it. The
miner combines accepted intents, the exact state transition and the preceding
terminal into the next `HistoryStep`. It proves the nonce-independent block
before searching for a PoW nonce.

Peers receive one atomic `{block, HistoryStep terminal}` bundle. They verify
the proof and nonce, then apply the proven slot writes to their local UTXO set.
They materialize the result without re-executing the transaction logic.

[See the complete proof and block flow →](architecture/overview.md)

## Mining is stateful

**Hashpower alone cannot produce blocks. Mining is stateful and proof-gated.**

An independent miner follows the canonical chain, holds the live UTXO state,
selects transactions and proves the exact next `HistoryStep`. Only after that
proof is complete can an internal or external worker search the immutable
Poseidon2b header nonce. A standalone hash engine cannot originate a block or
change the transition it is working on.

Mining infrastructure therefore doubles as network infrastructure: an
independent block producer is a proving full node backed by hashpower, not only
a nonce-search device.

[Understand mining and start a miner →](mining/index.md)

## A present that proves itself

Each `HistoryStep` proves the current block relation and verifies the previous
terminal inside the same relation. Proof size and verification work do not
increase with block height.

An active node keeps the exact live state, compact headers for cumulative work
and the latest 18 complete blocks for competing miners and reorgs. A joining
node authenticates a finalized state with its matching terminal, then verifies
the recent suffix normally.

ParanO(1)d is history-stateless, not state-free. State transfer scales with the
live UTXO set. What no longer scales with chain age is the execution required
to prove why that state is valid.

## Signatureless ownership

An address is the Poseidon2b image of a 256-bit spending secret. Ownership is a
zero-knowledge proof of knowledge of that preimage, bound to the complete
logical transaction. There is no public key or transaction signature on the
wire.

The authorization capsule is independently randomized on every spend,
including repeated use of the same address. Transaction consensus contains no
elliptic curves. The Ed25519 key used by libp2p identifies a peer only and has
no spending or consensus authority.

ParanO(1)d is transparent, not a privacy chain. Values, owners and relayed
transactions are public. Zero knowledge protects the spending witness;
privacy from transaction history comes from non-retention rather than
concealment.

## A living UTXO state

State is an exact sparse vector of indexed UTXOs. Spending clears a slot, and
the allocator reuses empty positions before opening new state. Every output
has a fresh `creation_id`, so reusing an index can never revive an old
reference.

The vector is divided into `2^16`-slot segments. Empty segments are virtual and
a segment disappears when its last UTXO is spent. The slot domain begins at
`2^24` and can expand without copying state, migrating outputs or pausing the
network.

Fees distinguish ordinary I/O from net-new state. The state-growth component
rises with occupancy and is burned; consolidation pays no growth burn. The
block reward halves when the state domain expands, with a permanent 1 NOID
floor.

## One binary proof stack

The protocol is built over the binary tower field `GF(2^128)`. Poseidon2b is
the common permutation for addresses, transactions, Merkle trees, state roots,
transcripts, block identifiers and proof of work.

FROST-GKR packs Poseidon2b batches and Merkle paths into direct degree-seven
relations over shared Boolean hypercubes. Batched sumchecks, zerocheck,
lincheck and FRI-Binius close the binary R1CS relation without a trusted setup.
Wallet authorization, exact state transition and recursive chain verification
therefore compose inside one arithmetic system instead of separate proof
systems joined afterward.

## A quantified post-quantum floor

Post-quantum security is treated as a property of the complete protocol, not a
label inherited from one signature scheme or proof primitive. The
security-critical components are accounted for separately and composed by
taking the weakest bound:

| Component | Post-quantum security |
|---|---:|
| Wallet authorization | 79 bits |
| Recursive `HistoryStep` | 83 bits |
| Poseidon2b collision resistance | 85 bits |
| Poseidon2b preimage resistance | 128 bits |
| **Complete protocol floor** | **79 bits** |

The result is a **proven 79-bit post-quantum engineering security floor across
the complete consensus proof pipeline**. The calculation is pinned in the
executable
[soundness ledger](https://github.com/ignotusnemo/parano1d/blob/main/noid_gkr/src/zk_auth_qrom.rs)
so protocol changes cannot silently alter the published figure.

## Protocol profile

| Parameter | Value |
|---|---:|
| Mean block target | 15 seconds |
| Default miner class | B64, `m=23`, up to 64 user pages |
| Large miner class | B255, `m=24`, up to 255 user pages |
| Maximum logical transactions per block | 255 |
| Maximum one-page throughput | 17 TPS |
| Maximum inputs in one transaction | 1,020 |
| Maximum outputs in one transaction | 256 |
| Recent block and reorg suffix | 18 blocks |
| State domain | `2^24` to `2^32` slots |

## Start

- Install the native GUI wallet from the
  [latest release](https://github.com/ignotusnemo/parano1d/releases). It
  includes and supervises its own full node.
- Read the [architecture overview](architecture/overview.md) to follow a
  transaction from the wallet to accepted state.
- [Run an ordinary node on Linux](operate/node.md).
- [Run an internal or external miner](mining/index.md).
- Inspect or build the
  [source](https://github.com/ignotusnemo/parano1d) with the pinned Rust
  toolchain.

The source code is the canonical definition of consensus behavior. The
protocol specification documents those rules in a stable, implementation-
independent form.
