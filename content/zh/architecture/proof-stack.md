# 证明栈

ParanO(1)d 使用同一个二进制算术栈处理所有权、State 转换、Merkle 关系、递归连续性以及工作量证明承诺。共同底层域是[二进制塔域](../reference/glossary.md#binary-tower-field) `GF(2^128)`。

![ParanO(1)d 证明栈](../../../assets/architecture/proof-stack.svg)

## Poseidon2b

[Poseidon2b](../reference/glossary.md#poseidon2b) 是全系统共同使用的置换：

| 参数 | 数值 |
|---|---:|
| 状态宽度 | 4 个域元素 |
| S-box | `x^7` |
| 全轮数 | 8 |
| 部分轮数 | 58 |

带类型的[域分离](../reference/glossary.md#domain-separation)标签把地址、物理页、逻辑交易、Merkle 节点、State 承诺、区块标识、PoW 摘要和证明交互记录分隔开。共用一个置换并不意味着共用同一个域分离上下文。

## [FROST-GKR](../research/frost-gkr.md)

FROST-GKR 把批量 Poseidon2b 执行与 Merkle 路径表示为共享布尔超立方体上的直接七次关系。ParanO(1)d 使用的是这种承诺列归约（committed-column reduction），而不是逐层重放电路。

该归约保留 GKR 的[多线性扩展](../reference/glossary.md#multilinear-extension)与 [sumcheck](../reference/glossary.md#sumcheck-family) 机制，同时用覆盖整条执行轨迹的全局关系替代递归电路层下降。共享列让大量置换与路径可以共同检查，无需为每个实例单独执行一次约束 sumcheck。

## 闭合关系

后续流水线组合：

- 批量 sumcheck；
- zerocheck；
- lincheck；
- 二进制域上的 [FRI-Binius/BaseFold](../reference/glossary.md#fri-family)。

最终证明系统是透明的，不需要[可信设置](../reference/glossary.md#trusted-setup)。发布的可执行文件内嵌经过认证的 [B64 与 B255](../reference/glossary.md#b64-b255) 矩阵包以及预期摘要。使用不同矩阵包的构建无法悄悄冒充规范关系。

## 钱包授权

钱包证明自己知道 `input_owner` 背后的 256 位原像，并把证明绑定到逻辑交易 ID。证明每次重新随机化、隐藏[见证](../reference/glossary.md#witness)数据，且不包含 State 路径。

序列化授权的最坏情况小于 61,000 字节。网络格式允许最高 256 KiB，使解码保持明确有界，同时为规范证明对象保留空间。

## HistoryStep

区块证明者确立完整公开转换，并在新关系中验证前一个终端。因此，新终端绑定：

```text
previous validity
        +
current block relation
        +
exact post-state
```

证明大小与终端验证不会随链高度增长。永久区块头留在递归之外，用于累计工作量和分叉选择。

## 安全性指标核算

实际部署的证明参数公开三个彼此独立命名的指标：

| 指标 | ParanO(1)d 数值 |
|---|---:|
| 按 Plonky2 / Toy Problem 原公式计算的 FRI 评分 | **基于猜想的 128 位安全性** |
| 钱包广义逐轮知识误差上界 | **对应 96.047 位，经典模型** |
| 按攻击计算量折算的固定无效区块有限次组合 | **对应 95.022 位，经典模型** |

第一项沿用 Plonky2 和 RISC Zero 公布的、基于猜想的码率与查询数约定。后两项分别刻画[逐轮可靠性（RBR）](../reference/glossary.md#round-by-round-soundness)知识误差与有限次组合，不会被改名为同一项指标。实际部署的参数常量、公式与测试发布在 [ParanO(1)d 可靠性分析仓库](https://github.com/ignotusnemo/parano1d-soundness)中。

声明边界与证明系统之外的假设见[安全模型](../protocol/security-model.md)，实现 crate 见[工作区结构](../developers/workspace.md)。
