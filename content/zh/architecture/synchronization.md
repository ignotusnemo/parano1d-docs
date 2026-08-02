# 同步

同步有两条路径。只落后[规范链尖](../reference/glossary.md#canonical-chain)少量区块的节点验证保留的完整区块；落后较多的节点认证已达最终性的[快照](../reference/glossary.md#snapshot)，再验证近期后缀。两条路径都不会信任对等节点对 [State](../reference/glossary.md#state) 的单方面声明。

![认证快照同步](../../../assets/architecture/snapshot-sync.svg)

## 较小高度差

每个全节点保留最近 18 个完整的已接受区块。新节点落后不超过 18 个区块时，请求原子包 `{block, HistoryStep 终端证明}` 并按顺序处理。这里的[终端证明](../reference/glossary.md#terminal)是固定形状的 `HistoryStep` 证明对象。

每个区块包都要检查：

- 父区块与高度连续性；
- 精确难度和时间戳规则；
- Poseidon2b 工作量证明；
- 交易与 State 承诺；
- 递归 [`HistoryStep`](../reference/glossary.md#historystep)；
- [分叉选择](../reference/glossary.md#fork-choice)与[硬最终性](../reference/glossary.md#hard-finality)限制。

通过后，节点物化已经证明的写入。

## 快照路径

落后 19 个区块或更多时使用快照协议：

1. 下载并验证永久区块头；
2. 选择已达最终性的快照边界；
3. 获取匹配的 `HistoryStep` 终端证明；
4. 下载[快照清单](../reference/glossary.md#snapshot-manifest)；
5. 下载并验证清单引用的 [State 分段](../reference/glossary.md#state-segment)；
6. 重建精确的全局 State 根；
7. 以事务方式安装临时区中的 State；
8. 验证并应用保留的完整后缀。

清单绑定边界高度、`state_root`、`log_slots`、`active_slot_count`、`alloc_counter`，以及精确的分段标识、根和长度。分段数据会逐一对照这些承诺。

对等节点只是数据来源。伪造、不完整或边界偏移的快照都会在安装前失败。

## 区块头链

区块头永久保存且十分紧凑。新节点从已知链起点一直验证到候选链尖，包括父链接、高度、时间戳、精确的 [ASERT](../reference/glossary.md#asert) 目标值与工作量证明。节点累计[工作量](../reference/glossary.md#cumulative-work)，并采用与在线节点相同的确定性分叉选择规则。

该阶段与区块头数量呈线性关系。随后，递归终端通过常数大小的证明，认证选定边界上的 State 有效性。

完整成本构成如下：

| 阶段 | 随什么增长 |
|---|---|
| 区块头验证 | 链高度 |
| 边界终端证明验证 | 常数 |
| [State](../reference/glossary.md#state) 传输与安装 | State 数据量 |
| 近期后缀 | 最多 18 个完整区块 |

Parano1d 消除的是历史执行重放；它并不声称无需读取区块头就能比较工作量证明，也不声称无需传输 Live State 就能完成同步。

## 事务化安装

快照数据写入临时区。分段到达期间，规范数据库不会改变。只有 State 根、计数器、边界区块头和终端证明全部一致的完整快照，才能替换当前 Live State。

如果进程在同步期间退出，启动时会删除过期临时区，并从最近一次安装的规范 Live State 继续同步。系统中不会存在需要修复的半安装快照。

## 增量服务

在线节点在临时区准备新快照时，仍可继续提供已经安装的 Live State。网络遥测分别显示区块头验证、终端证明检查、State 传输和后缀应用，使运维人员能够判断瓶颈来自 CPU、磁盘还是对等节点。

## [链重组](../reference/glossary.md#reorganization)

最终性边界之前的前缀不可重组。分叉选择只考虑保留该边界的候选链，允许的回滚深度必须小于 18，因此规范链重组最大为 17 个区块。

近期[撤销数据](../reference/glossary.md#undo-data)与完整区块覆盖这一后缀。更深的竞争历史会被拒绝，而不是通过快照重建。

精确分叉规则见[共识](../protocol/consensus.md)，网络消息边界见[网络](networking.md)。
