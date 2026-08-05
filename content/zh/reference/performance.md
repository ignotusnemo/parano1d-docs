# 性能测量

性能只对特定源码修订、证明配置、工件包、构建配置和主机成立。它不是共识常量，
也不能只按核心数量推算。

`research/two_class/results/` 中的归档表格生成于实际部署 C1 配置之前。它们仍是
旧实现的可复现记录，但不是当前实际部署性能。当前数据必须从活动源码和经过认证
的矩阵包重新生成。

报告至少应记录：

```text
Git 提交
Rust 版本
操作系统与内核
CPU 型号与逻辑拓扑
运行时选中的后端
矩阵包摘要
样本数与预热策略
p50 与最近秩 p95
```

## 钱包授权

钱包测试包含页面构建、逻辑哈希、一份授权证明封装、完整交易意图编码与解码，
以及本地授权证明封装准入；不包含网络延迟和区块 `HistoryStep` 证明。

```sh
NOID_WALLET_BENCH_SAMPLES=20 cargo run --release --locked \
  --manifest-path research/two_class/Cargo.toml \
  --bin two-class-wallet-bench
```

实际部署的 C1 钱包使用 65 次 Fiat–Shamir 查询。无论 `PagedSpend` 只有一页还是
占满 128 页，都只包含一份授权证明封装。规范序列化授权的最坏情况上界为
92,696 字节。

## HistoryStep

隔离的实际部署基准测试需要一份完整且经过认证的矩阵包。两个类别应分别运行，
使输出明确标识父类别与子类别。

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

`cargo bench` 使用优化后的 bench profile。每个样本覆盖实际部署证明生成与终端
创建。验证数据包含有界网络格式解码和完整终端验证。基准测试还会输出主证明字节
数、C1 sidecar 字节数以及求值声明数量。

## 端到端区块生产

隔离证明时间不等于完整挖矿延迟。容量判断必须测量整条路径：

```text
选择交易意图
  + 组装当前区块轨迹
  + 重放并绑定父终端
  + 生成 HistoryStep 证明
  + 搜索 nonce
  + 提交并接受区块
```

nonce 搜索与网络传播独立于证明生成而变化。B64 与 B255 都必须在最终主机上通过
完整实际部署路径测量。官方二进制保留可移植基线，并在运行时选择
`pclmul`、`avx2+vpclmul`、`avx512bw+vpclmul` 或 `neon+pmull` 后端。
