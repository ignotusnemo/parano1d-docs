# Network economics

ParanO(1)d ties issuance to Live State capacity and prices persistent State
growth separately from ordinary transaction work.

## Unit

```text
1 NOID = 1,000,000 μNOID
```

NOID is the currency ticker; the wallet uses ① as its interface symbol.
All consensus amounts are integers in μNOID.

## Block reward

The starting subsidy is 50 NOID. It halves whenever the State domain expands
and never falls below 1 NOID:

| `log_slots` | Capacity | Block reward |
|---:|---:|---:|
| 24 | 16,777,216 slots | 50.000000 NOID |
| 25 | 33,554,432 slots | 25.000000 NOID |
| 26 | 67,108,864 slots | 12.500000 NOID |
| 27 | 134,217,728 slots | 6.250000 NOID |
| 28 | 268,435,456 slots | 3.125000 NOID |
| 29 | 536,870,912 slots | 1.562500 NOID |
| 30–32 | Up to 4,294,967,296 slots | 1.000000 NOID |

Expansion requires sustained 75% occupancy in a hard-finalized window. The
network therefore moves to a lower inflation tier only after materially using
the current State capacity.

## Launch development allocation

For the first three target-time years, each block subsidy is divided:

- 90% to the miner;
- 5% to the O(1) Network Fund;
- 5% to ParanO(1)d Lab.

There is no premine. After height 6,307,200, the complete block subsidy goes to
the miner.

To avoid creating two extra live UTXOs in every block, the two development
shares are paid in one mandatory two-output system record every 5,760 target
blocks. The amount uses the reward tier active at that payout boundary. If the
State expands during the interval, the resulting difference remains unissued.

The payout schedule, recipients and amounts are derived statelessly from height
and `log_slots` and are proved inside `HistoryStep`. A miner cannot omit,
redirect or defer a due payout.

## Fees

The minimum transaction fee consists of:

- 5,000 μNOID per logical transaction;
- 100 μNOID per live input;
- 700 μNOID per live output;
- 2,500 μNOID times occupancy pressure for each net-new live slot.

Pressure multipliers are:

| Parent-State occupancy | Multiplier |
|---:|---:|
| Below 50% | 1× |
| 50% to below 75% | 2× |
| 75% to below 90% | 4× |
| 90% and above | 8× |

The State-growth component is burned. Base, input, output and voluntary tip
components are claimable by the miner.

A consolidation that turns several inputs into one output shrinks State and
pays no growth burn.

## Dynamic relay floor

The default mempool relays a transaction only when its fee satisfies both
consensus minimum and current relay policy. The dynamic floor is the greater
of 5,000 μNOID and 90% of the median fee among the last 50 transactions
admitted to that node's mempool.

This relay floor is local policy. Consensus fee accounting remains
deterministic from the transaction shape and parent-State occupancy.
