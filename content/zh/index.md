# ParanO(1)d

**A proof-native L1 statechain secured by proof of work.**

传统区块链存在一个根本性的架构缺陷：为了验证现在，节点必须重放过去。新全节点要从创世区块开始下载整条链并重新执行每一笔交易，因为当前状态本身无法证明其有效性。这不是暂时的工程限制，而是传统模型固有的代价。

ParanO(1)d 消除了这种依赖。

有效性只在信息完整的地方证明一次。钱包使用私有[见证数据](reference/glossary.md#witness)证明其支配资金的权利；矿工证明公开的交易逻辑以及精确的 State 转换；网络只需验证这些证明，不再重复执行同一批计算。

每个已接受的区块都携带递归 [`HistoryStep`](reference/glossary.md#historystep)：它证明该区块的精确 State 转换（包括新的 [UTXO](reference/glossary.md#utxo) 根），并验证前一个 `HistoryStep` 终端证明。新节点可以认证已达最终性的 State 并验证近期可重组后缀，而不必从创世区块重新执行整条链。

当 [Live State](reference/glossary.md#live-state) 能够自证有效时，已花费的 State 条目便可删除，其占用空间也可以复用。所有权不再需要公钥或数字签名；State 增长可以直接定价；[工作量证明](reference/glossary.md#proof-of-work)只负责排序已经证明有效的 State 转换。链龄不再自动变成更高的硬件门槛。

## 根本变化

| | 传统区块链 | ParanO(1)d |
|---|---|---|
| 验证 | 每个全节点都重新执行 | 见证数据持有者生成证明，网络负责验证 |
| 初始同步 | 从创世区块重建状态 | 认证已达最终性的 State 并验证近期后缀 |
| 所有权 | 公钥签名 | 每次支出新生成的 [Poseidon2b](reference/glossary.md#poseidon2b) 原像知识[零知识证明](reference/glossary.md#zero-knowledge-proof) |
| 当前状态 | 由累积历史推导 | 精确的 Live State 本身就是共识对象 |
| 已花费输出 | 仍属于必需历史 | [槽位](reference/glossary.md#slot)清空后可安全复用 |
| 工作量证明 | 排序执行日志 | 排序已证明有效的 State 转换 |
| 后量子迁移 | 替换所有权方案 | 交易共识中没有需要替换的椭圆曲线方案 |

## 一次转换，只证明一次

发送 NOID 时，钱包选择自己的 UTXO，并构造一笔原子的 [`PagedSpend`](reference/glossary.md#pagedspend)。它针对 `{logical_txid, input_owner}` 生成全新随机化、隐藏见证数据的[授权证明封装](reference/glossary.md#authorization-envelope)。256 位支出秘密始终留在钱包内。

该授权与 State 无关：其中不含 UTXO Merkle 路径，也不绑定某一个 State 根。矿工持有公开的 State 见证数据，并单独证明每个输入确实存在、每个输出槽为空、数值与手续费守恒，以及转换后的 State 根完全正确。

[内存池](reference/glossary.md#mempool)在转发前验证完整的[交易意图](reference/glossary.md#transaction-intent)。矿工把已接受的交易意图、精确 State 转换和前一个[终端证明](reference/glossary.md#terminal)合并进下一步 `HistoryStep`。它先证明与 [nonce](reference/glossary.md#nonce) 无关的区块语义，完成后才开始搜索 PoW nonce。

对等节点收到一个[已接受区块包](reference/glossary.md#accepted-block-bundle) `{block, HistoryStep 终端证明}`。节点验证证明与 nonce，随后把已经证明的槽位变化[物化](reference/glossary.md#materialization)到本地 UTXO 集。节点只物化结果，不重新执行交易逻辑。

[查看完整的证明与区块流程 →](architecture/overview.md)

## 挖矿依赖 State

**只有算力无法生成区块。挖矿需要 State；只有证明完成后才能开始搜索 nonce。**

独立矿工跟随规范链，持有 Live State，选择交易，并证明精确的下一步 `HistoryStep`。只有证明完成后，内置或外部挖矿进程才能搜索不可变 Poseidon2b 区块头的 nonce。孤立的哈希引擎既不能创建区块，也不能篡改其正在计算的 State 转换。

因此，挖矿设施同时也是网络设施：独立区块生产者是由算力支撑、能够生成证明的全节点，而不仅是一台搜索 nonce 的设备。

[了解挖矿并启动矿工 →](mining/index.md)

## 能够自证的 Live State

每个 `HistoryStep` 证明当前区块关系，并在同一个关系中验证前一个终端证明。证明大小与验证工作量不会随区块高度增长。

在线节点保存精确的 Live State、用于[累计工作量](reference/glossary.md#cumulative-work)的紧凑区块头，以及供竞争矿工和[链重组](reference/glossary.md#reorganization)使用的最近 18 个完整区块。新加入节点用匹配的终端证明认证已达最终性的 State，再按常规方式验证近期后缀。

ParanO(1)d 消除的是对历史执行的依赖，并非不保存 State。Live State 传输量仍随其中的 UTXO 数量增长；不再随链龄增长的，是证明“该 State 为何有效”所需的执行量。

## 无签名所有权

地址是 256 位支出秘密经 Poseidon2b 映射后的结果。所有权通过零知识证明来表达：证明者知道该原像，并把证明绑定到完整逻辑交易。网络中不存在交易公钥，也不存在交易签名。

每次支出都会独立随机化授权证明封装，即使重复使用同一地址也是如此。交易共识不包含椭圆曲线。libp2p 使用的 Ed25519 密钥只构成[对等节点身份](reference/glossary.md#peer-identity)，不具备支出权限或共识权力。

ParanO(1)d 是透明系统，并非隐私链。金额、所有者和网络中转发的交易都是公开的。零知识保护的是支出见证数据。协议存储机制会减少节点在正常运行中保留的交易体，但无法阻止第三方归档公开交易。

## 可复用的 Live State

State 是一个精确的、带索引的稀疏 UTXO 向量。支出会清空槽位，分配器优先复用空位，再扩展新的 State 空间。每个输出都有新的 [`creation_id`](reference/glossary.md#creation-id)，因此复用索引绝不会让旧引用重新生效。

向量按每段 `2^16` 个槽位切分。空段是虚拟的；最后一个 UTXO 被花费后，整段便会消失。槽位域从 `2^24` 开始扩展，无需复制 State、迁移输出或暂停网络。

手续费区分普通 I/O 与净新增 State。[State 增长费](reference/glossary.md#state-growth-fee)随占用率上升并被销毁；归集不支付 State 增长费。每次扩展 State 域时，区块奖励减半，但永久保留 1 NOID 的下限。

## 统一的二进制证明栈

协议构建在[二进制塔域](reference/glossary.md#binary-tower-field) `GF(2^128)` 上。Poseidon2b 是地址、交易、Merkle 树、State 根、[交互记录](reference/glossary.md#transcript)、区块标识和工作量证明共同使用的置换。

[FROST-GKR](research/frost-gkr.md) 把批量 Poseidon2b 与 Merkle 路径压入共享布尔超立方体上的直接七次关系。批量 [sumcheck、zerocheck 与 lincheck](reference/glossary.md#sumcheck-family) 以及 [FRI-Binius](reference/glossary.md#fri-family) 在无需[可信设置](reference/glossary.md#trusted-setup)的前提下闭合二进制 [R1CS](reference/glossary.md#r1cs) 关系。钱包授权、精确 State 转换和递归链验证因而能在同一算术系统中组合，而不是事后拼接多个互不相同的证明系统。

## 行业证明安全性指标

ParanO(1)d 沿用成熟 FRI 与 STARK 项目公开采用的、带明确适用范围的约定报告证明安全性。在 Plonky2 和 RISC Zero 采用的 [Toy Problem 猜想](reference/glossary.md#toy-problem-conjecture)原公式约定下，实际部署的钱包与 `HistoryStep` 参数都达到 `GF(2^128)` 的域上限：**基于猜想的 FRI 安全性为 128 位**。

| 已发布系统与指标 | 已发布数值 | ParanO(1)d 在对应指标下的数值 |
|---|---:|---:|
| [Plonky2 默认 FRI](https://github.com/0xPolygonZero/plonky2#security)，Toy Problem 猜想 | 基于猜想的 100 位安全性 | 基于同一猜想的 128 位安全性 |
| [RISC Zero 可靠性计算器](https://github.com/risc0/risc0/blob/release-3.0/risc0/zkp/src/prove/soundness.rs#L15-L35)，Toy Problem 猜想 | `2^20` 时为基于猜想的 97 位安全性，`2^24` 时为 95 位 | 基于同一猜想的 128 位安全性 |
| [ethSTARK / StarkWare](https://www.starknet.io/blog/safe-and-sound-a-deep-dive-into-stark-security/)，[逐轮可靠性（RBR）](reference/glossary.md#round-by-round-soundness)与 `t/e(t)` 操作次数分析 | 96 位 RBR [IOP](reference/glossary.md#iop) 前提；编译后 STARK 结果为 95 位 | 钱包广义 RBR [知识误差](reference/glossary.md#knowledge-error)上界对应 96.047 位；按攻击计算量折算的固定无效区块有限次组合对应 95.022 位 |

这些指标保留各自的原始名称，因为它们描述的是不同的安全游戏。完整的[安全模型](protocol/security-model.md)逐项定义 ParanO(1)d 的数值，并链接可复现的公式与测试。按照透明 STARK 与 FRI 系统通行的术语，交易证明栈具有后量子抗性：它采用透明、基于哈希的构造，不需要可信设置，也不含椭圆曲线交易签名。

## 协议概况

| 参数 | 数值 |
|---|---:|
| 平均目标出块时间 | 15 秒 |
| 默认矿工类别 | [B64](reference/glossary.md#b64-b255)，`m=23`，最多 64 个用户页 |
| 大型矿工类别 | B255，`m=24`，最多 255 个用户页 |
| 每个区块的最大逻辑交易数 | 255 |
| 单页交易的最大吞吐量 | 17 TPS |
| 单笔交易的最大输入数 | 1,020 |
| 单笔交易的最大输出数 | 256 |
| 近期区块与重组后缀 | 18 个区块 |
| State 域 | `2^24` 至 `2^32` 个槽位 |

## 开始使用

- 从[最新版本](https://github.com/ignotusnemo/parano1d/releases)安装原生 GUI 钱包。钱包自带并管理一个完整节点。
- 阅读[架构概览](architecture/overview.md)，跟踪交易从钱包进入已接受的 State 的完整过程。
- [在 Linux 上运行普通节点](operate/node.md)。
- [运行内置或外部矿工](mining/index.md)。
- 使用项目固定的 Rust toolchain 查看或构建[源代码](https://github.com/ignotusnemo/parano1d)。

源代码是共识行为的规范定义。协议规范以稳定、独立于具体实现的形式记录这些规则。
