# 术语表

## 活动地址

钱包当前用于发送、找零和默认内置挖矿奖励的所有者。其他已生成地址仍然
有效，但不会把它们的 UTXO 混入活动所有者的花费。

## Accepted block bundle

规范区块字节及其匹配 `HistoryStep` terminal 组成的原子对。

## B64 / B255

启动时的两种 `HistoryStep` 证明类别。两者证明同一个关系，只是有效页面
容量不同。

## Block ID

包含 nonce 的完整规范区块头经过域分离 Poseidon2b 得到的哈希。用于父
链接与链身份。

## 区块体保留

完整区块交易数据可被提供的 18 区块窗口。区块头永久保存。

## Creation ID

UTXO 写入槽位时分配的新标识符。它可以防止旧引用花费同一数值槽位的后续
占用者。

## FROST-GKR

一种 committed-column reduction：在共享布尔超立方上表达批量 Poseidon2b
与 Merkle 关系，再通过 multilinear sumcheck 进行归约。

## 硬最终性

共识规则：候选链不得替换最近 18 区块 suffix 之前的前缀。

## History-stateless

验证无需重放历史交易。节点仍然保存并传输当前实时状态。

## HistoryStep

递归区块关系，用于证明当前转换有效、后状态精确，以及与前一 terminal
连续。

## 逻辑交易

一笔原子的 `PagedSpend`，可以由多个物理页组成，但只有一个 ID 和一份
钱包授权。

## 物化

把已经证明的规范槽位变化写入完整节点的精确本地状态。它不同于派生或证明
该转换。

## μNOID

最小货币单位。1 NOID 等于 1,000,000 μNOID。

## PagedSpend

由 1 到 128 个有序 `Tx8x2` 页组成的一笔原子钱包 intent。

## 收据

自包含交易陈述及八层 Merkle 路径，用于证明交易被纳入某个声明的规范区块
头交易根。

## Semantic header ID

在 `HistoryStep` 内绑定的无 nonce 区块头投影。它承诺所有其他共识重要的
区块头字段。

## 槽位

精确稀疏 UTXO 向量中的一个带索引位置。

## 快照

在已最终化边界传输实时状态的分段格式。安装前会验证 manifest、段根、
规范区块头和 terminal。

## 状态增长销毁

净增加实时 UTXO 槽位所支付的费用部分。它随占用率变化，矿工不能领取。

## Terminal

当前 `HistoryStep` 的固定形状递归证明输出。

## Tx8x2

固定的物理交易体，可容纳八个输入和两个输出。
