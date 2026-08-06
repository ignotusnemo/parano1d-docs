# Consensus parameters

This page groups the launch consensus constants. Values are integers unless
stated otherwise.

## Time and finality

| Parameter | Value |
|---|---:|
| Target block interval | 15 seconds |
| ASERT reference epoch | 6 blocks |
| ASERT half-life | 90 seconds |
| Median-time-past window | 11 headers |
| Maximum future timestamp drift | 120 seconds |
| Transaction epoch | 144 blocks |
| Hard-finality depth | 18 blocks |
| Maximum accepted reorganization | 17 blocks |
| Recent block-body retention | 18 blocks |
| Undo retention | 36 blocks |

## Block limits

| Parameter | Value |
|---|---:|
| Fixed bodies including system records | 256 |
| User page positions | 255 |
| User page positions on payout block | 254 |
| Live user inputs | 1,020 |
| Live user outputs | 510 |
| Live user actions | 1,530 |
| Distinct State segments touched | 256 |
| Transaction-tree leaves | 256 |

## Transaction limits

| Parameter | Value |
|---|---:|
| Physical page encoding | 323 bytes |
| Inputs per page | 8 |
| Outputs per page | 2 |
| Pages per logical spend | 1–128 |
| Inputs per logical spend | 1–1,020 |
| Outputs per logical spend | 0–256 |
| Authorization wire cap | 256 KiB |
| Logical intent wire cap | 303,495 bytes |

## State

| Parameter | Value |
|---|---:|
| Initial `log_slots` | 24 |
| Maximum `log_slots` | 32 |
| Slots per segment | `2^16` |
| Expansion occupancy | 75% |
| Expansion finalized window | 18 headers |
| Required high-occupancy headers | 10 of 18 |

## Proof classes

| Class | Dimension | Effective page positions |
|---|---:|---:|
| B25 | 22 | 0–25 |
| B255 | 24 | 26–255 |

The primary reward is excluded from effective page-position count. A live
development payout counts as one position.

## Monetary

| Parameter | Value |
|---|---:|
| Atomic unit | 1 μNOID |
| Units per NOID | 1,000,000 |
| Starting subsidy | 50 NOID |
| Permanent subsidy floor | 1 NOID |
| Base transaction fee | 5,000 μNOID |
| Fee per live input | 100 μNOID |
| Fee per live output | 700 μNOID |
| Base growth fee per net-new slot | 2,500 μNOID |
| Development allocation period | 6,307,200 blocks |
| Development payout interval | 5,760 blocks |

## Storage and network

| Parameter | Value |
|---|---:|
| Header encoding | 212 bytes |
| P2P TCP port | 9400 |
| Local RPC TCP port | 9401 |
| Direct-sync header request | 512 headers |
| Header protocol batch cap | 4,096 headers |
| Mempool transaction count | 1,024 |
| Mempool intent-byte budget | 384 MiB |
| Peer-store entries | 500 |
| External template lifetime | 30 seconds |
