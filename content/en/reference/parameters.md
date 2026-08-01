# Protocol parameter reference

## Core

```text
block target             15 seconds
ASERT epoch               6 blocks
ASERT half-life          90 seconds
median-time-past         11 headers
future drift            120 seconds
transaction epoch       144 blocks
hard finality            18 blocks
```

## State

```text
initial domain           2^24 slots
maximum domain           2^32 slots
segment                  2^16 slots
expansion threshold      75%
finalized sample         18 headers
expansion majority       10 / 18
```

## Transactions and blocks

```text
Tx8x2 page               8 inputs / 2 outputs / 323 bytes
PagedSpend               1..128 pages
logical input cap        1,020
logical output cap       256
block body cap           256 fixed bodies
ordinary user pages      255
payout-block user pages  254
block user outputs       510
touched segments         256
```

## Proof system

```text
field                    GF(2^128)
Poseidon2b width         4
S-box                    x^7
full rounds              8
partial rounds           58
B64                      m=23, up to 64 positions
B255                     m=24, up to 255 positions
FRI security score       128 bits conjectured (Toy Problem)
wallet generalized RBR   96.047 bits classical
fixed-block work score   95.022 bits classical
```

## Monetary

```text
1 NOID                   1,000,000 μNOID
initial subsidy          50 NOID
subsidy floor            1 NOID
base fee                 5,000 μNOID
input fee                100 μNOID
output fee               700 μNOID
base growth fee          2,500 μNOID / net-new slot
```

The explanatory and boundary rules are in
[Consensus parameters](../protocol/parameters.md).
