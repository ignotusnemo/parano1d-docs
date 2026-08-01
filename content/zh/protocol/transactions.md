# 交易协议

用户交易是一个规范[逻辑交易](../reference/glossary.md#logical-transaction) [`PagedSpend`](../reference/glossary.md#pagedspend)，由 1 至 128 个固定 [`Tx8x2` 物理页](../reference/glossary.md#tx8x2)以及恰好一份独立的[授权证明封装](../reference/glossary.md#authorization-envelope)组成。

## 物理页

每一页都采用固定 323 字节物理页编码：

| 字段 | 含义 |
|---|---|
| `epoch_anchor` | 当前 144 区块防重放[交易周期（epoch）锚点](../reference/glossary.md#transaction-epoch-anchor) |
| `fee` | 第一页上的逻辑手续费；后续页为零 |
| `input_owner` | 所有有效输入共同的所有者 |
| `inputs[8]` | 可能的 `{slot_index, amount, creation_id}` 记录 |
| `outputs[2]` | 可能的 `{slot_index, amount, owner}` 记录 |
| `validity_bitmap` | 有效记录及逻辑开始/结束位图 |
| `is_coinbase` | 所有用户页均为 `false` |

位 0–7 选择输入，位 8–9 选择输出，位 10 和 11 标记逻辑组的开始与结束。其他位图位均不得置位。

有效位为零的记录必须是全零规范占位记录，从而消除同一命题的替代编码。

## 交易组有效性

有效 `PagedSpend` 必须满足全部规则：

- 页面数为 1 至 128；
- 只有第零页带开始标记；
- 只有最后一页带结束标记；
- 每页具有相同的 `input_owner` 与 `epoch_anchor`；
- 只有第一页可携带非零手续费；
- 有效输入和输出按页面顺序紧密排列；
- 对于这些记录，页面数必须最小；
- 至少有一个有效输入；
- 输入不得重复；
- 输出槽位不得重复；
- 同一笔支出中，输出槽位不得同时作为输入槽位；
- 最多 1,020 个输入和 256 个输出；
- 输入总额等于输出总额加手续费；
- 分离授权不超过 256 KiB。

规范意图的最大编码长度为 303,495 字节。

## 逻辑交易 ID

单个物理页的哈希不能独立标识付款。逻辑 ID 是对以下内容执行带域分离的 Poseidon2b 海绵函数：

```text
version || page_count || ordered_page_hashes
```

初始协议版本为 `1`。重新排序、添加或删除页面都会改变 ID。授权证明封装针对这一精确逻辑 ID，证明其生成者知道 `input_owner` 背后的原像。

## State 检查

对于每个输入，当前[槽位](../reference/glossary.md#slot)记录中的[所有者](../reference/glossary.md#owner)、金额和 [`creation_id`](../reference/glossary.md#creation-id) 必须与交易声明完全一致。对于每个输出，目标槽位必须为空且位于当前有效槽位域内。

输出 `creation_id` 不是交易字段。共识从转换后 State 的分配序列中为其赋值，用户不能选择或复用。

区块转换对完整逻辑组原子地执行所有 State 检查。

## 手续费

最低手续费为（公式中的字段名与传输对象保持一致）：

```text
5,000
+ 100 × live_inputs
+ 700 × live_outputs
+ growth_price × max(0, live_outputs - live_inputs)
```

所有金额均以 μNOID 表示。`growth_price` 从每个净新增槽 2,500 μNOID 开始，并根据父 State 占用率乘以 1、2、4 或 8。

[State 增长费](../reference/glossary.md#state-growth-fee)会被销毁。超过必要最低值的部分是矿工可领取的自愿追加手续费。维持或缩减 State 的支出不支付 State 增长费。

## 交易周期（epoch）锚点

每页使用当前交易周期锚点。对于子高度 `C > 0`，锚点是以下高度上的区块 ID：

```text
floor((C - 1) / 144) × 144
```

高度 144 仍使用高度 0 的锚点；高度 145 开始使用高度 144。[内存池](../reference/glossary.md#mempool)会删除交易周期锚点已不再有效的意图。

## 授权与 State 分离

钱包授权只证明所有权，不证明当前槽位成员关系，也不包含 Live State 的 Merkle 路径。

区块 `HistoryStep` 证明当前成员关系、空槽、余额、分配以及转换后 State 根。两项命题绑定同一公开逻辑交易。

## 系统记录

主要奖励与计划中的开发付款使用同一种固定[系统记录](../reference/glossary.md#system-record)物理页格式，但并非用户 `PagedSpend` 意图。其形状、位置、接收者和金额完全由区块上下文推导，无需钱包授权。

钱包与内存池流程见[交易架构](../architecture/transactions.md)。
