# Security model

Parano1d combines proof of work, recursive validity, exact Live State and
signatureless wallet authorization. Each mechanism has a distinct job.

## What consensus establishes

An accepted canonical tip establishes that:

- its headers form the greatest-work eligible chain known to the node;
- every accepted block preserves the hard-finalized prefix;
- every wallet-authorized input belongs to a prover who knew the owner's
  256-bit secret;
- every input existed and every output target was empty in the exact parent
  State;
- values, fees, issuance and allocation followed consensus;
- the committed post-State is the exact result;
- recursive validity reaches the current terminal.

Proof of work orders valid transitions. It does not repair invalid proofs.
Recursive proofs establish validity. They do not replace fork choice.

## Industry proof-security profile

Security figures are reported with the same scoped labels used by established
FRI and STARK implementations. The production parameters are pinned to the
source revision used by the executable calculator.

| Published system and metric | Published value | Parano1d under the corresponding metric |
|---|---:|---:|
| [Plonky2 default FRI](https://github.com/0xPolygonZero/plonky2#security), Toy Problem conjecture | **100 bits conjectured**; default Poseidon estimated at about **95 bits** | **128 bits conjectured**, using the literal Plonky2 formula and production field cap |
| [RISC Zero soundness calculator](https://github.com/risc0/risc0/blob/release-3.0/risc0/zkp/src/prove/soundness.rs#L15-L35), Toy Problem conjecture | **97 bits conjectured** at `SEGMENT_SIZE = 2^20`; **95 bits conjectured** at `2^24` | **128 bits conjectured**, using the corresponding rate/query calculation |
| [ethSTARK / StarkWare](https://www.starknet.io/blog/safe-and-sound-a-deep-dive-into-stark-security/), round-by-round and `t/e(t)` operation-count analysis | **96-bit RBR** IOP premise; **95-bit** compiled-STARK result under its stated operation-count definition | **96.047-bit** wallet generalized-RBR knowledge bound; **95.022-bit** fixed-invalid-block work-accounted finite composition |

The first Parano1d value is the literal Plonky2/Toy Problem score

```text
min(field bits, query count * log2(inverse rate) + pre-query grind bits).
```

The wallet uses 64 queries at rate `1/32` with a 16-bit pre-query grind;
`HistoryStep` uses 125 queries at rate `1/4` with the same grind. Both raw
scores exceed 128 bits and are capped by `GF(2^128)`.

The last row reports different scalar conventions. `96.047` is the negative
base-two logarithm of the largest generalized round-by-round knowledge-error
bound among the moves of the interactive wallet base IOP. `95.022` is the
fixed-invalid-block finite composition when the mandatory grind is charged
only to the query term that follows it. Neither is silently substituted for
the 128-bit conjectured FRI score.

All production inputs, formulas, finite ceilings and regression tests are in
the [Parano1d soundness workbench](https://github.com/ignotusnemo/parano1d-soundness).
The corresponding Parano1d Lab
[analysis](https://lab.parano1d.org/research/parano1d-soundness-industry-metrics/)
explains the comparison in full.

In the terminology used for transparent STARK and FRI systems, the transaction
proof stack is post-quantum resistant: it is transparent and hash-based,
requires no trusted setup and contains no elliptic-curve transaction
signature. Poseidon2b is used for addresses, commitments and transcripts; the
proof arithmetic is over the binary tower field `GF(2^128)`. The numerical
claims above remain attached to their exact published conventions rather than
being collapsed into a different end-to-end metric.

## Trust boundaries

The protocol does not require:

- a trusted proving setup;
- a trusted snapshot publisher;
- historical transaction-body archives for validation;
- a public-key transaction signature scheme;
- permission from seed nodes or peers.

The released binary embeds authenticated proof matrices. Snapshot State is
checked against canonical headers and the matching terminal before
installation.

## Wallet boundary

The 256-bit master secret grants spending authority. Compromise of the device,
secret file or original photo-derived material compromises the wallet.
Consensus cannot distinguish the owner from an attacker who knows the same
secret.

Receipts are local records, not derived secrets. Losing them does not lose
funds, but can remove durable payment evidence after old block bodies are
pruned.

## Network boundary

Peer Ed25519 keys authenticate libp2p sessions only. They do not participate in
wallet or block authorization. DNS seeds help locate peers but cannot define
the canonical chain.

Connection diversity, message limits, staged synchronization and mempool
budgets bound common resource attacks. Operators should still keep RPC on
loopback, protect wallet files and use independent network paths for public
infrastructure.

## Transparency

Parano1d is not an anonymity system. Transaction owners, amounts, slots and
fees are transparent while bodies are available. Zero knowledge hides the
wallet secret and proves execution; it does not conceal the public ledger
statement.

## Finality assumption

Consensus refuses a reorganization that changes the prefix deeper than the
18-block finality boundary. Operators and applications may choose to wait for
additional confirmations inside the recent suffix, but no peer can present a
deeper branch as eligible under the same rules.

For operational protection, see
[Backup and recovery](../wallet/backup-recovery.md) and
[Configuration](../operate/configuration.md). Consensus checks are collected
in [Consensus invariants](invariants.md).
