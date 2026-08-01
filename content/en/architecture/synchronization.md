# Synchronization

Synchronization has two paths. A node close to the tip verifies retained
complete blocks. A node farther behind authenticates a finalized snapshot and
then verifies the recent suffix. Neither path trusts a peer's claim about
State.

![Authenticated snapshot synchronization](../assets/architecture/snapshot-sync.svg)

## Short gaps

Every full node retains the latest 18 complete accepted blocks. If a joining
node is no more than 18 blocks behind, it requests those atomic
`{block, HistoryStep terminal}` bundles and processes them in order.

For each bundle it checks:

- parent and height continuity;
- exact difficulty and timestamp rules;
- Poseidon2b proof of work;
- transaction and State commitments;
- the recursive `HistoryStep`;
- fork-choice and hard-finality constraints.

The node then materializes the proven writes.

## Snapshot path

A gap of 19 blocks or more uses the snapshot protocol:

1. download and validate permanent headers;
2. choose the finalized snapshot boundary;
3. obtain the matching `HistoryStep` terminal;
4. download the State manifest;
5. download and verify the referenced State segments;
6. reconstruct the exact global State root;
7. install the staged State transactionally;
8. verify and apply the retained complete suffix.

The manifest binds the boundary height, `state_root`, `log_slots`,
`active_slot_count`, `alloc_counter`, and the exact segment identifiers, roots
and lengths. Segment payloads are checked against those commitments.

The peer is only a data source. A forged, incomplete or boundary-shifted
snapshot fails before installation.

## Header chain

Headers are permanent and compact. The joining node validates them from its
known chain origin to the candidate tip, including parent links, height,
timestamps, exact ASERT targets and proof of work. It accumulates work and
applies the same deterministic fork-choice rule as an already-running node.

This phase is linear in header count. The recursive terminal then verifies
validity at the chosen boundary in constant proof-verification work.

The full cost profile is:

| Phase | Scales with |
|---|---|
| Header validation | Chain height |
| Boundary terminal verification | Constant |
| State transfer and installation | Live State |
| Recent suffix | At most 18 complete blocks |

ParanO(1)d removes historical execution replay; it does not pretend that proof
of work can be compared without reading headers or that current State can be
downloaded without transferring it.

## Transactional staging

Snapshot data is written to a scratch environment. The canonical database is
not changed while segments are arriving. Only a complete snapshot whose root,
counters, boundary header and terminal agree can replace the active State.

If the process exits during synchronization, the stale staging area is removed
at startup and synchronization begins from the last installed canonical State.
There is no partially installed snapshot to repair.

## Incremental service

An online node can continue serving its installed State while a newer snapshot
is staged. Network telemetry separates header validation, terminal checking,
State transfer and suffix application so operators can see whether progress is
CPU-, disk- or peer-bound.

## Reorganizations

The finalized boundary is not reorganizable. Fork choice considers only
candidate chains that preserve it, and the accepted rollback depth must be
less than 18. The maximum canonical reorganization is therefore 17 blocks.

Recent undo data and complete blocks cover this suffix. A deeper competing
history is rejected rather than reconstructed through a snapshot.

For the exact fork rule, see [Consensus](../protocol/consensus.md). Network
message boundaries are described in [Networking](networking.md).
