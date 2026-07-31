# 外部矿工

外部挖矿把 PoW nonce 搜索与节点分离。Mempool、交易选择、状态转换、
`HistoryStep` 证明、模板以及区块中继仍由节点掌控。

Worker 不会收到区块体或证明 witness。

## 本地 worker

使用 bearer token 以外部矿工模式启动节点：

```sh
parano1d --mode extminer --mining-key 'LONG-RANDOM-TOKEN'
```

在另一个终端运行：

```sh
parano1d-miner \
  --rpc http://127.0.0.1:9401 \
  --key 'LONG-RANDOM-TOKEN'
```

如果节点使用 `--mining-key` 启动，即使通过 loopback 连接也必须提供
token。

需要时可限制 worker 线程：

```sh
parano1d-miner --key 'LONG-RANDOM-TOKEN' --threads 8
```

## 远程 worker

切勿把未加密的 bearer token 和通用 RPC 接口直接暴露到互联网。

应把 worker 与节点放在经过认证的私有网络中，或由反向代理终止 TLS 并
限制暴露路径。只有安全传输就绪后才绑定公网 RPC：

```sh
parano1d \
  --mode extminer \
  --rpc-listen 0.0.0.0:9401 \
  --mining-key 'LONG-RANDOM-TOKEN'
```

防火墙应只允许指定 worker 或代理访问该端口。

## 奖励地址

模板默认使用节点配置的奖励地址，这是更安全的单机挖矿方式。

若允许 worker 请求自己的奖励地址，节点运营者必须显式启用：

```sh
parano1d \
  --mode extminer \
  --mining-key 'LONG-RANDOM-TOKEN' \
  --allow-custom-coinbase
```

此后 worker 可以使用：

```sh
parano1d-miner \
  --key 'LONG-RANDOM-TOKEN' \
  --coinbase o1...
```

自定义 coinbase 只改变证明构建前嵌入的奖励地址，worker 仍无法修改已经
证明的模板。

## 模板生命周期

`getBlockTemplate` 返回不透明的一次性 ID、16 字段 PoW schedule、
nonce 索引和 target。Worker 搜索随机且互不重叠的 nonce 范围，再通过
`submitBlock` 提交恰好 16 个 little-endian nonce 字节。

模板在 30 秒后过期；规范链尖变化、成功提交或节点主动取消也会使其失效。
结果过期是正常现象，worker 会在下一次轮询时请求新模板。

## 诊断

运行：

```sh
parano1d-miner --check-hardware
```

请求失败时：

- `401 Unauthorized` 表示 token 缺失或不匹配；
- 自定义 coinbase 错误表示节点未启用该功能；
- 模板不断过期通常表示节点持续收到新链尖，或证明准备超过模板生命周期；
- 没有模板表示节点尚未同步、对等节点数量不足，或不在 `extminer` 模式。
