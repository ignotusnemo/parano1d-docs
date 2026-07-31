# Glossary

## Active address

The wallet owner currently used for sends, change and default internal-mining
payout. Other generated addresses remain valid but are not mixed into the
active owner's spend.

## Accepted block bundle

The atomic pair of canonical block bytes and its matching `HistoryStep`
terminal.

## B64 / B255

The two launch `HistoryStep` proof classes. They prove the same relation with
different effective page capacities.

## Block ID

The nonce-bearing, domain-separated Poseidon2b hash of the complete canonical
header. Used for parent links and chain identity.

## Body retention

The 18-block window in which complete block transaction data is served.
Headers are permanent.

## Creation ID

A fresh identifier assigned when a UTXO is installed in a slot. It prevents a
stale reference from spending a later occupant of the same numerical slot.

## FROST-GKR

The committed-column reduction that expresses batched Poseidon2b and Merkle
relations over shared Boolean hypercubes and reduces them through multilinear
sumchecks.

## Hard finality

The consensus rule that excludes candidate chains replacing the prefix deeper
than the most recent 18-block suffix.

## History-stateless

Validation does not require historical transaction replay. A node still stores
and transfers current live state.

## HistoryStep

The recursive block relation proving current transition validity, exact
post-state and the preceding terminal.

## Logical transaction

One atomic `PagedSpend`, possibly made of several physical pages, with one ID
and one wallet authorization.

## Materialization

Writing already-proven canonical slot changes into a full node's exact local
state. It is distinct from deriving or proving the transition.

## μNOID

The atomic currency unit. One NOID is 1,000,000 μNOID.

## PagedSpend

One to 128 ordered `Tx8x2` pages joined into one atomic wallet intent.

## Receipt

A self-contained transaction statement and eight-level Merkle path proving
inclusion under a claimed canonical header transaction root.

## Semantic header ID

The nonce-free header projection bound inside `HistoryStep`. It commits to
every other consensus-significant header field.

## Slot

One indexed position in the exact sparse UTXO vector.

## Snapshot

A segmented transport of live state at a finalized boundary. Its manifest,
segment roots, canonical header and terminal are verified before installation.

## State-growth burn

The fee component paid for a net increase in live UTXO slots. It scales with
occupancy and cannot be claimed by the miner.

## Terminal

The fixed-shape recursive proof output for the current `HistoryStep`.

## Tx8x2

The fixed physical transaction body with eight possible inputs and two
possible outputs.
