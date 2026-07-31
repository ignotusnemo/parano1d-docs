# Proof stack

ParanO(1)d uses one binary arithmetic stack for ownership, state transitions,
Merkle relations, recursive continuity and proof of work commitments. The
shared field is the binary tower field `GF(2^128)`.

![ParanO(1)d proof stack](../assets/architecture/proof-stack.svg)

## Poseidon2b

Poseidon2b is the common permutation:

| Parameter | Value |
|---|---:|
| State width | 4 field elements |
| S-box | `x^7` |
| Full rounds | 8 |
| Partial rounds | 58 |

Typed domain tags separate addresses, physical pages, logical transactions,
Merkle nodes, state commitments, block identifiers, PoW digests and proof
transcripts. Sharing a permutation does not mean sharing a hash domain.

## FROST-GKR

FROST-GKR expresses batched Poseidon2b executions and Merkle paths as direct
degree-seven relations over shared Boolean hypercubes. It is the committed-
column reduction used by ParanO(1)d, not a layer-by-layer replay of a circuit.

The reduction keeps the multilinear-extension and sumcheck machinery of GKR
while replacing recursive circuit-layer descent with global relations over
the execution trace. Shared columns let many permutations and paths be checked
without paying for an independent constraint sumcheck for every instance.

## Closing the relation

The downstream pipeline combines:

- batched sumcheck;
- zerocheck;
- lincheck;
- FRI-Binius/BaseFold over the binary field.

The resulting proof system is transparent: it requires no trusted setup.
The released binaries embed authenticated B64 and B255 matrix packs, including
their expected digests. A build using a different pack cannot silently present
it as the canonical relation.

## Wallet authorization

The wallet proves knowledge of the 256-bit preimage behind `input_owner`,
bound to the logical transaction ID. The proof is freshly randomized and
witness-hiding. It contains no state path.

The serialized authorization stays below a 61,000-byte worst-case bound. The
wire format permits up to 256 KiB so decoding remains explicitly bounded while
leaving room for the canonical proof object.

## HistoryStep

The block prover establishes the complete public transition and verifies the
previous terminal inside the new relation. The next terminal therefore binds:

```text
previous validity
        +
current block relation
        +
exact post-state
```

Proof size and terminal verification do not grow with chain height. Permanent
headers remain outside recursion for proof-of-work accumulation and fork
choice.

## Security accounting

The executable
[soundness ledger](https://github.com/ignotusnemo/parano1d/blob/main/noid_gkr/src/zk_auth_qrom.rs)
pins the project-level bounds:

| Component | Bound |
|---|---:|
| Wallet base IOP | 95 bits |
| Wallet authorization in QROM | 79 bits |
| HistoryStep, classical | 100 bits |
| HistoryStep in QROM | 83 bits |
| Poseidon2b preimage, post-quantum | 128 bits |
| Poseidon2b collision, post-quantum | 85 bits |
| Complete consensus proof pipeline | **79 bits** |

Composition uses the weakest applicable bound. The published result is a
proven 79-bit post-quantum engineering security floor across the complete
consensus proof pipeline, pinned by that ledger.

For claim boundaries and non-proof assumptions, see
[Security model](../protocol/security-model.md). Implementation crates are
mapped in [Workspace](../developers/workspace.md).
