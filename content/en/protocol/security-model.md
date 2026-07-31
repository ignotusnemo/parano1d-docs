# Security model

ParanO(1)d combines proof of work, recursive validity, exact live state and
signatureless wallet authorization. Each mechanism has a distinct job.

## What consensus establishes

An accepted canonical tip establishes that:

- its headers form the greatest-work eligible chain known to the node;
- every accepted block preserves the hard-finalized prefix;
- every wallet-authorized input belongs to a prover who knew the owner's
  256-bit secret;
- every input existed and every output target was empty in the exact parent
  state;
- values, fees, issuance and allocation followed consensus;
- the committed post-state is the exact result;
- recursive validity reaches the current terminal.

Proof of work orders valid transitions. It does not repair invalid proofs.
Recursive proofs establish validity. They do not replace fork choice.

## Post-quantum proof floor

The project accounts for the complete consensus proof path rather than applying
a label to one primitive:

| Component | Post-quantum bound |
|---|---:|
| Wallet authorization | 79 bits |
| Recursive `HistoryStep` | 83 bits |
| Poseidon2b collision resistance | 85 bits |
| Poseidon2b preimage resistance | 128 bits |
| **Composed floor** | **79 bits** |

The result is a proven 79-bit post-quantum engineering security floor across
the complete consensus proof pipeline. These values are pinned in the
executable
[soundness ledger](https://github.com/ignotusnemo/parano1d/blob/main/noid_gkr/src/zk_auth_qrom.rs)
and tested as part of the build.

## Trust boundaries

The protocol does not require:

- a trusted proving setup;
- a trusted snapshot publisher;
- historical transaction-body archives for validation;
- a public-key transaction signature scheme;
- permission from seed nodes or peers.

The released binary embeds authenticated proof matrices. Snapshot state is
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

ParanO(1)d is not an anonymity system. Transaction owners, amounts, slots and
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
