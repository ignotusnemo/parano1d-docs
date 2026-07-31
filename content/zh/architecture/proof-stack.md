# 证明栈

ParanO(1)d 使用同一个二进制算术栈处理所有权、状态转换、Merkle 关系、递归连续性以及工作量证明 commitment。共同底层域是二进制塔域 `GF(2^128)`。

![ParanO(1)d 证明栈](../assets/architecture/proof-stack.svg)

## Poseidon2b

Poseidon2b 是全系统共同使用的置换：

| 参数 | 数值 |
|---|---:|
| 状态宽度 | 4 个域元素 |
| S-box | `x^7` |
| 全轮数 | 8 |
| 部分轮数 | 58 |

带类型的域标签把地址、物理页、逻辑交易、Merkle 节点、状态 commitment、区块标识、PoW digest 和证明 transcript 分隔开。共用一个置换并不意味着共用同一个哈希域。

## FROST-GKR

FROST-GKR 把批量 Poseidon2b 执行与 Merkle 路径表示为共享布尔超立方体上的直接七次关系。ParanO(1)d 使用的是这种 committed-column reduction，而不是逐层重放电路。

该 reduction 保留 GKR 的 multilinear extension 与 sumcheck 机制，同时用覆盖整个 execution trace 的全局关系替代递归电路层下降。共享列让大量置换与路径可以共同检查，无需为每个实例单独支付一次 constraint sumcheck。

## 闭合关系

后续流水线组合：

- 批量 sumcheck；
- zerocheck；
- lincheck；
- 二进制域上的 FRI-Binius/BaseFold。

最终证明系统是透明的，不需要可信设置。发布二进制内嵌经过认证的 B64 与 B255 矩阵包以及预期 digest。使用不同矩阵包的构建无法悄悄冒充规范关系。

## 钱包授权

钱包证明自己知道 `input_owner` 背后的 256 位原像，并把证明绑定到逻辑交易 ID。证明每次重新随机化、隐藏 witness，且不包含状态路径。

序列化授权的最坏情况小于 61,000 字节。Wire format 允许最高 256 KiB，使解码保持明确有界，同时为规范证明对象保留空间。

## HistoryStep

区块 prover 确立完整公开转换，并在新关系中验证前一个终端。因此，新终端绑定：

```text
previous validity
        +
current block relation
        +
exact post-state
```

证明大小与终端验证不会随链高度增长。永久区块头留在递归之外，用于累计工作量和分叉选择。

## 安全强度核算

可执行的
[可靠性账本](https://github.com/ignotusnemo/parano1d/blob/main/noid_gkr/src/zk_auth_qrom.rs)
固定项目级安全界：

| 组件 | 安全界 |
|---|---:|
| 钱包基础 IOP | 95 位 |
| QROM 中的钱包授权 | 79 位 |
| `HistoryStep`，经典模型 | 100 位 |
| QROM 中的 `HistoryStep` | 83 位 |
| Poseidon2b 原像，后量子模型 | 128 位 |
| Poseidon2b 碰撞，后量子模型 | 85 位 |
| 完整共识证明流水线 | **79 位** |

组合结果取所有适用界中的最弱值。已经发布的结果是：完整共识证明流水线具有经过证明的 79 位后量子工程安全下界，并由该账本固定。

声明边界与证明系统之外的假设见[安全模型](../protocol/security-model.md)，实现 crate 见[Workspace 结构](../developers/workspace.md)。
