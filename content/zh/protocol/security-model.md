# 安全模型

Parano1d 组合[工作量证明](../reference/glossary.md#proof-of-work)、[递归有效性](../reference/glossary.md#recursive-validity)、[Live State](../reference/glossary.md#live-state) 以及无签名钱包授权。每种机制各司其职。

## 共识确立什么

一个已接受的[规范链尖](../reference/glossary.md#canonical-chain)确立以下事实：

- 其区块头构成节点已知、具有最大工作量的合格链；
- 每个已接受区块都保留具备硬最终性的前缀；
- 每个经钱包授权的输入都属于知道所有者 256 位秘密的证明者；
- 每个输入存在，且每个输出目标在精确的父 State 中为空；
- 数值、手续费、发行与分配遵守共识；
- 所承诺的转换后 State 是精确结果；
- 递归有效性连续至当前终端证明。

工作量证明排序有效转换，但不能修复无效证明。递归证明确立有效性，但不能替代分叉选择。

## 行业证明安全性指标

安全性数值沿用成熟 FRI 与 STARK 实现公开采用的、带明确适用范围的名称。实际部署的参数固定到可执行计算所对应的源代码版本。

| 已发布系统与指标 | 已发布数值 | Parano1d 在对应指标下的数值 |
|---|---:|---:|
| [Plonky2 默认 FRI](https://github.com/0xPolygonZero/plonky2#security)，Toy Problem 猜想 | 基于猜想的 **100 位**安全性；项目估计默认 Poseidon 配置约为 **95 位** | 基于同一猜想的 **128 位**安全性，按 Plonky2 原公式计算，并受实际部署实现所用域大小限制 |
| [RISC Zero 可靠性计算器](https://github.com/risc0/risc0/blob/release-3.0/risc0/zkp/src/prove/soundness.rs#L15-L35)，Toy Problem 猜想 | `SEGMENT_SIZE = 2^20` 时为基于猜想的 **97 位**安全性；`2^24` 时为 **95 位** | 基于同一猜想的 **128 位**安全性，采用对应的码率与查询数计算 |
| [ethSTARK / StarkWare](https://www.starknet.io/blog/safe-and-sound-a-deep-dive-into-stark-security/)，逐轮分析与 `t/e(t)` 操作次数分析 | **96 位 RBR** IOP 前提；按其操作次数定义得到 **95 位**编译后 STARK 结果 | 钱包广义 RBR 知识误差上界对应 **96.047 位**；按攻击计算量折算的固定无效区块有限次组合对应 **95.022 位** |

Parano1d 的第一项数值按 Plonky2 / Toy Problem 原公式计算：

```text
min(域位数, 查询数 * log2(码率倒数) + 查询前 grinding 位数)。
```

钱包使用 64 次查询、`1/32` 码率和 16 位查询前[穷举（grinding）](../reference/glossary.md#grinding)；`HistoryStep` 使用 125 次查询、`1/4` 码率和相同的 grinding。两项原始评分都超过 128 位，最终受 `GF(2^128)` 限制为 128 位。

最后一行报告的是两种不同的标量约定。`96.047` 是交互式钱包基础 [IOP](../reference/glossary.md#iop) 各轮中最大广义[逐轮可靠性（RBR）](../reference/glossary.md#round-by-round-soundness)[知识误差](../reference/glossary.md#knowledge-error)上界的以二为底负对数。`95.022` 是固定无效区块的有限次组合，其中强制 grinding 只计入紧随其后的查询项。两者都不会被悄然替代为基于猜想的 128 位 FRI 评分。

全部实际部署参数、公式、有限上界和回归测试都收录在 [Parano1d 可靠性分析仓库](https://github.com/ignotusnemo/parano1d-soundness)中。对应的 Parano1d Lab [分析文章](https://lab.parano1d.org/research/parano1d-soundness-industry-metrics/)完整说明了比较方法。

按照透明 STARK 与 FRI 系统通行的术语，交易证明栈具有[后量子抗性](../reference/glossary.md#post-quantum-resistance)：它采用透明、基于哈希的构造，不需要可信设置，也不含椭圆曲线交易签名。地址、承诺和交互记录使用 Poseidon2b，证明算术运行在二进制塔域 `GF(2^128)` 上。上述数值声明分别保留其明确命名的公开约定，不会被合并成另一项端到端指标。

## 信任边界

协议不需要：

- 可信设置；
- 可信快照发布者；
- 用于验证的历史交易体档案；
- 公钥交易签名方案；
- seed 节点或对等节点许可。

发布二进制内嵌经过认证的证明矩阵。安装快照前，State 会与规范区块头和匹配的终端证明核对。

## 钱包边界

256 位主密钥授予支出权限。设备、秘密文件或照片派生原始材料泄露都会导致钱包失陷。共识无法区分真正所有者和知道同一秘密的攻击者。

收据是本地记录，不是派生秘密。丢失收据不会丢失资金，但在旧区块体裁剪后，可能失去持久付款证据。

## 网络边界

对等节点的 Ed25519 密钥只认证 libp2p 会话，不参与钱包或区块授权。DNS 种子帮助定位对等节点，但不能定义规范链。

连接多样性、消息限制、暂存式同步与内存池预算可限制常见资源攻击的影响。运维人员仍应把 RPC 仅绑定到本机回环地址、保护钱包文件，并为公共基础设施使用彼此独立的网络路径。

## 透明性

Parano1d 不是匿名系统。交易所有者、金额、槽位和手续费都是公开信息；区块体被普通节点裁剪后，第三方仍可能保留其归档。零知识隐藏钱包秘密并证明执行，但不会隐藏公开账本命题。

## 最终性假设

共识拒绝任何会改变 18 区块最终性边界之前前缀的重组。运维人员和应用可以选择在近期后缀内等待更多确认，但任何对等节点都不能按相同规则把更深分支作为合格候选链。

运维保护见[备份与恢复](../wallet/backup-recovery.md)和[配置](../operate/configuration.md)，共识检查汇总于[共识不变量](invariants.md)。
