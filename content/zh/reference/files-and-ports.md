# 文件、端口与限制

## 默认路径

| 路径 | 用途 | 权限性质 |
|---|---|---|
| `~/.parano1d/parano1d.toml` | Core 配置 | 运营者 |
| `~/.parano1d/gui-settings.json` | GUI 偏好 | 本地 UI |
| `~/.parano1d/data/` | Core 与 GUI 节点默认数据 | 共识状态 |
| `DATA_DIR/wallet.key` | 256 位钱包主密钥 | 花费权限 |
| `DATA_DIR/wallet.receipts` | 已保存的外发收据 | 本地付款证据 |
| `DATA_DIR/wallet.history` | 本地钱包历史 | 本地展示 |
| `DATA_DIR/p2p_identity.key` | 稳定 libp2p Ed25519 身份 | 仅网络身份 |
| `DATA_DIR/peers.json` | 成功连接过的公网出站节点 | 发现提示 |
| `DATA_DIR/history-step-cache/` | 派生的本地证明矩阵缓存 | 可重建 |
| `DATA_DIR/snapshot-staging/` | 接收快照临时数据 | 永不作为规范状态 |
| `DATA_DIR/parano1d-gui.toml` | GUI 管理的节点配置 | 私有节点 |
| `DATA_DIR/parano1d-node.log` | GUI 管理的节点日志 | 诊断 |

Windows 中的 `~` 表示用户配置文件目录。

Unix 上，`wallet.key` 和 `p2p_identity.key` 仅允许所有者访问。前者控制
资金，后者不具备花费权限。

## 端口

| 端口 | 绑定 | 用途 | 是否公开 |
|---:|---|---|---|
| TCP 9400 | `0.0.0.0` | libp2p | 是 |
| TCP 9401 | `127.0.0.1` | JSON-RPC | 否 |

远程外部挖矿只能通过受保护的私有或 TLS 传输使用 RPC。Bearer token
认证请求，但不加密传输。

## 网络身份

| 项目 | 值 |
|---|---|
| Network magic | `NOID` |
| libp2p 协议 | `/noid/mainnet/1.0.0` |
| 交易与区块 gossip | GossipSub |
| 发现 | DNS 种子、Kademlia、mDNS |

## 保留窗口

| 数据 | 窗口 |
|---|---:|
| 区块头 | 永久 |
| 完整已接受区块 | 18 |
| 可重组 suffix | 18 |
| 最大重组 | 17 |
| Undo 记录 | 36 |
| 交易 epoch | 144 |

收据可在区块体保留窗口之外保存特定付款的纳入证据。

## 本地资源限制

| 资源 | 限制 |
|---|---:|
| Mempool 逻辑交易 | 1,024 |
| Mempool intent 字节 | 384 MiB |
| Peer store 条目 | 500 |
| 每个已保存 peer 的地址数 | 8 |
| 启动 peer anchor | 8 |
| 每个网络组的公网出站 peer | 2 |
| 每个 IP 的公网入站 peer | 8 |
| 每个网络组的公网入站 peer | 32 |
| 区块头批量 | 512 |
| 同时导出的快照 | 2 |
| 待处理状态段请求 | 64 |
| 外部模板生命周期 | 30 秒 |

## RPC 边界

| 操作 | 上限 |
|---|---:|
| 状态 atlas | 256 buckets |
| 返回的槽位提示 | 256 |
| 近期交易页 | 32 行 |
| 收据页 | 50 行 |
| 已挖区块页 | 50 行 |
| 导入地址发现 | 20 个候选 |
| 交互式归集 | 64 个输入 |
