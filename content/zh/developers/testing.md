# 测试

ParanO(1)d 使用三层测试：crate 级不变量、跨 crate 发布测试，以及全新进程
live 场景。

## 快速检查

针对性修改前运行：

```sh
cargo fmt --all -- --check
cargo check --locked --workspace --all-targets
cargo test --locked -p CHANGED_CRATE
```

协议代码还应包含直接依赖者。交易改动通常至少需要：

```sh
cargo test --locked \
  -p noid_tx \
  -p noid_chain \
  -p noid_mempool \
  -p noid_miner \
  -p noid_rpc \
  -p noid_node
```

## 证明 kernel

正式 kernel 测试应使用 release 模式：

```sh
cargo test --locked --release \
  -p noid_core \
  -p noid_poseidon2b \
  -p noid-ivc-core
```

x86-64 上强制测试正式最低后端：

```sh
NOID_CPU_BACKEND=pclmul \
  cargo test --locked --release \
  -p noid_core -p noid_poseidon2b -p noid-ivc-core
```

标量后端只用于差分检查：

```sh
NOID_CPU_BACKEND=scalar \
  cargo test --locked --release \
  -p noid_core -p noid_poseidon2b
```

## Release gates

`scripts/build_release.sh` 会认证规范矩阵 pack、将其嵌入、运行原生发布测试，
并 smoke-test：

- 硬件 preflight；
- 节点帮助和启动边界；
- CLI；
- 外部矿工；
- 已打包 GUI self-check。

Debug 二进制或没有 pack 的开发节点不能算作区块生产测试。

## Live 场景

Live 脚本会在 `target/live-tests` 下创建全新数据目录，并运行真实进程、
RPC、P2P、MDBX 和正式证明路径。

| 场景 | 覆盖范围 |
|---|---|
| `live_single_transaction_scenario.py` | 钱包 → mempool → 矿工 → 规范区块 |
| `live_multi_transaction_mempool_scenario.py` | 三个互不冲突的 intent 与中继 |
| `live_large_mempool_single_miner_scenario.py` | 由 B64 区块清空 128 个 intent |
| `live_large_mempool_two_miners_scenario.py` | 矿工竞争下的大 mempool |
| `live_two_miner_fork_reorg_scenario.py` | 竞争子区块与浅层重组 |
| `live_connected_miner_restart_sync_scenario.py` | 矿工重启与过期父区块防护 |
| `live_mining_peer_gate_scenario.py` | 普通对等节点数量要求 |
| `live_sync_scenarios.py` | 全新、5 区块和 19 区块同步边界 |
| `live_incremental_snapshot_scenario.py` | 完整与增量快照发布 |
| `live_sync_announced_tip_scenario.py` | 以宣布链尖为上界的追赶同步 |
| `live_state_restart_scenario.py` | 紧凑状态重启和首个新区块 |
| `live_state_slot_lifecycle_scenario.py` | 槽位清除、复用、密度与重启 |
| `live_receipt_lifecycle_scenario.py` | 收据保存、篡改、重启与区块体裁剪后验证 |
| `live_wallet_active_address_scenario.py` | 生成、注资、激活并持久化所有者 |
| `live_wallet_mining_payout_switch_scenario.py` | 原子切换奖励所有者 |
| `live_wallet_receive_online_scenario.py` | 在线接收者增量更新 |
| `live_wallet_receive_offline_shallow_scenario.py` | 通过保留区块恢复离线接收者 |
| `live_wallet_receive_offline_snapshot_scenario.py` | 通过快照同步恢复离线接收者 |
| `live_slot_mempool_wallet_scenarios.py` | Salted 提示、多节点发送与收敛 |
| `live_p2p_identity_handshake_scenario.py` | 持久 peer ID 与对称 handshake |
| `live_p2p_fan_in_scenario.py` | 并发入站 handshake 负载 |
| `live_p2p_inbound_sybil_scenario.py` | 每 IP 入站限制 |
| `live_p2p_outbound_diversity_scenario.py` | 出站网络组多样性 |
| `live_p2p_mesh_block_scenario.py` | 跨出首选 mesh 的区块中继 |

每个脚本开头都说明环境参数和二进制要求。从仓库根目录运行：

```sh
python3 scripts/live_two_miner_fork_reorg_scenario.py
```

## 边界改动

靠近最终性、epoch 或状态扩展的修改，需要显式边界向量，不能只依赖长时间
happy path。应覆盖：

- 交易锚点高度 143、144、145；
- 17 和 18 区块 fork 深度；
- 18 和 19 区块同步差距；
- 占用率 9/9 和 10/8 的已最终化扩展窗口；
- 使用完整 36 区块头扩展 lookback 的重启；
- 奖励分配边界和最终 allocation 高度；
- 从一个 `log_slots` 层级扩展到下一个。

测试应使用隔离数据目录。并发运行时可以使用不同端口，但不得修改 fixture
或正式数据。
