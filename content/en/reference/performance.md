# Performance measurement

Performance is a property of one source revision, proof profile, artifact pack,
build profile and host. It is not a consensus constant and cannot be inferred
from core count alone.

The archived tables under `research/two_class/results/` predate the production
C1 profile. They remain reproducible records of that earlier implementation,
but they are not current production measurements. Current figures must be
generated from the active source and authenticated matrix pack.

Record at least:

```text
git commit
Rust version
OS and kernel
CPU model and logical topology
selected runtime backend
matrix-pack digests
sample count and warm-up policy
p50 and nearest-rank p95
```

## Wallet authorization

The wallet harness measures page construction, logical hashing, one
authorization capsule, complete intent encode/decode and local capsule
admission. It excludes network latency and block `HistoryStep` proving.

```sh
NOID_WALLET_BENCH_SAMPLES=20 cargo run --release --locked \
  --manifest-path research/two_class/Cargo.toml \
  --bin two-class-wallet-bench
```

The production C1 wallet uses 65 Fiat–Shamir queries. One `PagedSpend` still
contains one authorization capsule whether it occupies one page or the full
128 pages. The canonical serialized authorization has a 92,696-byte worst-case
bound.

## HistoryStep

The isolated production benchmark requires a completed and authenticated
matrix pack. Run each class separately so the output identifies the exact
parent and child class.

```sh
NOID_PACK_ROOT=../parano1d-artifacts/history-step-pack-v1
source "$NOID_PACK_ROOT/pins.env"
export NOID_HISTORY_STEP_PACK_DIR="$NOID_PACK_ROOT"

NOID_HISTORY_STEP_BENCH_FILTER=B64 \
NOID_HISTORY_STEP_BENCH_SAMPLES=20 \
cargo bench --locked -p bench_prover --bench history_step_proof

NOID_HISTORY_STEP_BENCH_FILTER=B255 \
NOID_HISTORY_STEP_BENCH_SAMPLES=20 \
cargo bench --locked -p bench_prover --bench history_step_proof
```

`cargo bench` uses the optimized bench profile. Each reported sample covers
production proof construction and terminal creation. Verification includes
bounded wire decoding and complete terminal verification. The benchmark also
reports field-proof bytes, C1 sidecar bytes and opening-claim count.

## End-to-end block production

The isolated proof time is not the complete mining latency. Capacity decisions
must measure:

```text
select intents
  + assemble the current block trace
  + replay and bind the parent terminal
  + prove HistoryStep
  + search the nonce
  + submit and accept the block
```

Nonce search and network propagation vary independently from proof
construction. B64 and B255 qualification must use the complete production path
on the final host. Official binaries keep a portable baseline and select the
`pclmul`, `avx2+vpclmul`, `avx512bw+vpclmul` or `neon+pmull` backend at runtime.
