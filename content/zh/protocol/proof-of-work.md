# 工作量证明

ParanO(1)d 的工作量证明是在固定语义区块头字段上计算的带域分离 Poseidon2b digest。它只在无 nonce `HistoryStep` 完成证明后运行。

## 字段 schedule

`POWHDR__` sponge 精确吸收 16 个 `GF(2^128)` 元素：

| 索引 | 字段 |
|---:|---|
| 0–1 | `prev_block_hash` |
| 2–3 | `state_root` |
| 4–5 | `tx_root` |
| 6 | `timestamp` |
| 7 | `height` |
| 8–9 | `miner_address` |
| 10 | 128 位 nonce |
| 11–12 | `difficulty_target` |
| 13 | `log_slots` |
| 14 | `active_slot_count` |
| 15 | `alloc_counter` |

32 字节值拆成两个 little-endian 128 位半段，标量整数以零扩展。Sponge rate 为二，因此 schedule 恰好占八个 rate block，不需要变长 padding。

PoW 域同时区别于含 nonce 区块身份域和无 nonce 语义区块头 commitment 域。

## Target 比较

Digest 与 target 均解释为 256 位 little-endian 整数。Nonce 只有在以下条件成立时有效：

```text
pow_digest < difficulty_target
```

相等也视为失败。

## ASERT

目标出块间隔为 15 秒。ASERT 使用六区块参考 epoch 和 90 秒 half-life。在每个高度，验证根据规范 anchor、经过时间与高度差推导精确 target。

时间戳还必须大于前 11 个区块头的 median time past，并且最多领先验证节点本地时钟 120 秒。

## 运行时内核

同一个固定置换按 nonce 批次计算。生产二进制在运行时选择主机支持的最佳实现：

- x86-64 上的 PCLMULQDQ baseline；
- 可用时使用带 VPCLMULQDQ 的 AVX2；
- 支持主机上的 AVX-512；
- ARM64 上带 PMULL 的 NEON。

批量执行只改变吞吐量，不改变 digest。标量实现是测试 oracle，不作为生产 fallback。

## 外部挖矿边界

外部 worker 收到精确的 16 字段 schedule、nonce 索引与 target，只返回规范的 16 字节 little-endian nonce。节点在提交区块前，针对不可变的一次性模板验证结果。

Worker 无法修改交易、状态根、收益地址或证明。过期或陈旧模板求得的 nonce 会被拒绝。
