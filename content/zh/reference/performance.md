# 性能测量

性能数据描述的是指定机器上的实测实现。它们不是共识常量，也不能只根据
核心数量推算到无关 CPU。

参考系统：

```text
CPU       Intel Core i7-1365U
Topology  10 cores / 12 threads
ISA       AVX2 + VPCLMULQDQ, no AVX-512
OS        Linux 6.17 x86-64
Rust      1.96.0
```

每张表都报告预热后 20 个实测样本，p95 使用 nearest-rank estimator。

## 钱包授权路径

钱包 benchmark 包含页面构建、逻辑哈希、一份授权 capsule、完整 intent
编码/解码，以及本地 capsule 准入；不包含网络延迟和区块 `HistoryStep`
证明。

| 场景 | 页数 | 总 p50 | 总 p95 | Proof / intent 大小 |
|---|---:|---:|---:|---:|
| 1 个输入 | 1 | 228.30 ms | 352.47 ms | 56.49 / 56.81 KiB |
| 100 个输入 | 13 | 217.32 ms | 255.46 ms | 56.58 / 60.69 KiB |
| 1,020 个输入 | 128 | 233.06 ms | 285.81 ms | 56.11 / 96.50 KiB |

1,020 输入场景仍只生成一份授权 capsule。更多输入会增加页面哈希和序列化
intent 大小，但不会增加钱包证明数量。

复现 harness：

```sh
NOID_WALLET_BENCH_SAMPLES=20 cargo run --release \
  --manifest-path research/two_class/Cargo.toml \
  --bin two-class-wallet-bench
```

## HistoryStep 类别

完整准备时间包含 assembly 与 proving。验证时间测量完整节点使用的
terminal verifier。

| 类别 | 有效行 | 准备 p50 / p95 | 验证 p50 / p95 | Terminal |
|---|---:|---:|---:|---:|
| B64, `m=23` | 5,705,307 | 11.472 / 14.387 s | 0.666 / 0.720 s | 766,549 B |
| B255, `m=24` | 15,368,233 | 24.189 / 29.755 s | 0.770 / 1.012 s | 807,189 B |

在该主机上，B64 以 613 ms 余量通过严格的 15 秒 p95 准备门槛。B255
没有通过，因此正式容量 selector 正确地让矿工保持在 B64。相比生成证明，
普通节点验证两类证明的成本都很低。

Benchmark 使用 Thin LTO、一个 codegen unit 和 `target-cpu=native` 来测量
实际主机。官方二进制保留可移植进程 baseline，并在运行时选择证明与 PoW
kernel，因此也必须在目标机器上检查发布包速度。

## 如何理解数据

钱包表测量本地授权，不是确认时间。HistoryStep 表测量区块准备，不是预期
proof-of-work 搜索时间。网络传播与 nonce 搜索独立变化。

矿工应评估完整路径：

```text
select intents
  + assemble witness
  + prove HistoryStep
  + search nonce
  + submit and accept block
```

如果完整准备无法满足目标区块间隔，只优化一个内部阶段不足以启用更大的
证明类别。

源码仓库在 `research/two_class/results/` 中保存了带命令行、commit、矩阵
digest 和原始样本的归档报告。
