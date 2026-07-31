# Performance measurements

Performance figures describe a measured implementation on a named machine.
They are not consensus constants and should not be projected onto an unrelated
CPU from core count alone.

The reference system used:

```text
CPU       Intel Core i7-1365U
Topology  10 cores / 12 threads
ISA       AVX2 + VPCLMULQDQ, no AVX-512
OS        Linux 6.17 x86-64
Rust      1.96.0
```

Each table reports 20 measured samples after warm-up. p95 uses the
nearest-rank estimator.

## Wallet authorization path

The wallet benchmark includes page construction, logical hashing, one
authorization capsule, complete intent encode/decode and local capsule
admission. It excludes network latency and block `HistoryStep` proving.

| Case | Pages | Total p50 | Total p95 | Proof / intent size |
|---|---:|---:|---:|---:|
| 1 input | 1 | 228.30 ms | 352.47 ms | 56.49 / 56.81 KiB |
| 100 inputs | 13 | 217.32 ms | 255.46 ms | 56.58 / 60.69 KiB |
| 1,020 inputs | 128 | 233.06 ms | 285.81 ms | 56.11 / 96.50 KiB |

The 1,020-input case still produces one authorization capsule. Larger input
sets increase page hashing and serialized intent size, but not the number of
wallet proofs.

Reproduce the harness with:

```sh
NOID_WALLET_BENCH_SAMPLES=20 cargo run --release \
  --manifest-path research/two_class/Cargo.toml \
  --bin two-class-wallet-bench
```

## HistoryStep classes

Complete preparation is assembly plus proving. Verification measures the
terminal verifier used by a full node.

| Class | Useful rows | Prepare p50 / p95 | Verify p50 / p95 | Terminal |
|---|---:|---:|---:|---:|
| B64, `m=23` | 5,705,307 | 11.472 / 14.387 s | 0.666 / 0.720 s | 766,549 B |
| B255, `m=24` | 15,368,233 | 24.189 / 29.755 s | 0.770 / 1.012 s | 807,189 B |

On this host, B64 passed the strict 15-second p95 preparation gate with 613 ms
of margin. B255 did not, so the production capacity selector correctly kept
the miner at B64. Both classes remain inexpensive for an ordinary node to
verify relative to proving them.

The benchmark used Thin LTO, one codegen unit and `target-cpu=native` to
measure the exact host. Official binaries keep a portable process baseline and
select proof and PoW kernels at runtime; therefore release-package timing must
also be checked on its destination.

## Reading the figures

The wallet table measures local authorization, not time to confirmation. The
HistoryStep table measures block preparation, not expected proof-of-work search
time. Network propagation and nonce search vary independently.

For a miner, qualify the complete path:

```text
select intents
  + assemble witness
  + prove HistoryStep
  + search nonce
  + submit and accept block
```

Optimizing one internal phase does not justify enabling a larger proof class
if complete preparation misses the target interval.

The archived reports in the source repository record command lines, commits,
matrix digests and raw samples under `research/two_class/results/`.
