# Workspace

仓库按证明边界与信任边界拆分，而不是按二进制文件拆分。

## 算术与证明基础

| Crate | 职责 |
|---|---|
| `noid_core` | 二进制塔域、packed kernel 与 CPU dispatch |
| `noid_poseidon2b` | Poseidon2b 置换、域、哈希与批量执行 |
| `noid_fri` | FRI 原语 |
| `noid_fri_binius` | 二进制域 FRI-Binius/BaseFold 集成 |
| `noid_ivc_core` | 递归公共 I/O 与 verifier 基础 |
| `noid_ivc_prover` | 递归 prover 实现 |
| `noid_gkr` | FROST-GKR 关系与钱包授权 |
| `noid_recursive` | `HistoryStep`、精确状态关系与递归接受 |
| `bench_prover` | 矩阵生成、pin 工具与证明 benchmark |

## 协议对象

| Crate | 职责 |
|---|---|
| `noid_tx` | 固定 `Tx8x2`、逻辑 `PagedSpend`、ID 与授权绑定 |
| `noid_block` | 区块级证明组合 |
| `noid_chain` | 区块头、共识、状态、费用、收据、MDBX 与快照 |

`noid_tx` 包含无需链上下文即可检查的表示层规则。`noid_chain` 再加入当前
epoch、实时状态、发行、allocation 和 fork 上下文。

## Runtime

| Crate | 职责 |
|---|---|
| `noid_mempool` | Intent 准入、CPU permit、冲突与选择元数据 |
| `noid_miner` | 共享 CPU 计划、模板构建、证明和 PoW |
| `noid_p2p` | libp2p 发现、gossip、同步与资源限制 |
| `noid_rpc` | 类型化 JSON-RPC API 与钱包操作 |
| `noid_node` | Daemon、CLI、钱包状态与子系统协调 |
| `noid_gui` | 原生多语言钱包及私有节点管理 |
| `noid_extminer` | 外部 Poseidon2b nonce worker |

## 依赖方向

预期方向为：

```text
field / hashes / proof primitives
            ↓
transaction and block relations
            ↓
chain consensus and storage
            ↓
mempool / miner / P2P / RPC
            ↓
node and GUI applications
```

底层 crate 不调用 GUI、RPC 或网络策略。共识类型不依赖钱包标签或应用
展示。

## 共识敏感修改

修改以下任意内容都属于共识敏感：

- 规范字节编码；
- Poseidon2b 字段顺序或 domain tag；
- 交易或区块有效性；
- 状态根派生；
- 发行、费用销毁或 allocation；
- 难度、timestamp、最终性或扩展规则；
- `HistoryStep` relation 或认证矩阵。

此类修改需要更新向量、relation 测试、矩阵 pack 和嵌入 pins。只有新矩阵
pack 而没有对应源码语义，不能构成升级机制。

## 仅应用层的修改

翻译、布局、钱包标签、日志展示和普通 RPC 响应格式都在共识之外，前提是
不改变提交给节点的序列化对象。

钱包选币同样属于策略。最终 `PagedSpend` 仍必须满足与其他实现构建交易
完全相同的共识规则。
