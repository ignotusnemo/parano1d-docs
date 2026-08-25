# 在本机运行 Core

Core 压缩包面向节点运营者、矿工和开发者，其中包含：

- `parano1d`：完整节点与内置矿工；
- `parano1d-cli`：本地节点及钱包客户端；
- `parano1d-miner`：外部 PoW 工作进程。

GUI 钱包单独发布。

## 下载与校验

请选择与主机平台匹配的 Core 压缩包：

```text
parano1d-core-vVERSION-linux-x86_64.tar.gz
parano1d-core-vVERSION-linux-aarch64.tar.gz
parano1d-core-vVERSION-windows-x86_64.zip
parano1d-core-vVERSION-macos-aarch64.tar.gz
parano1d-core-vVERSION-macos-x86_64.tar.gz
```

解压前，请将文件的 SHA-256 摘要与同一版本中的 `SHA256SUMS` 对照。

## 检查 CPU

Linux 或 macOS：

```sh
./parano1d --check-hardware
```

Windows PowerShell：

```powershell
.\parano1d.exe --check-hardware
```

最后一行必须是：

```text
NODE READY
```

x86-64 发布版节点要求 SSE4.1 和 PCLMULQDQ，ARM64 则要求 NEON 和
PMULL。运行时会自动选择 `pclmul`、`avx2+vpclmul`、`avx512bw+vpclmul`
或 `neon+pmull` 后端。

虚拟机注意事项、内存需求与磁盘容量规划见
[硬件与容量](../operate/hardware.md)。

## 启动普通节点

在前台运行 Core：

```sh
./parano1d
```

首次启动会创建：

```text
~/.parano1d/parano1d.toml
~/.parano1d/data/
```

在另一个终端中可以检查节点：

```sh
./parano1d-cli status
./parano1d-cli peers
./parano1d-cli state
```

默认 P2P 监听地址是 `0.0.0.0:9600`，RPC 仅监听
`127.0.0.1:9601`。

请使用以下命令正常停止节点：

```sh
./parano1d-cli stop
```

常驻系统服务、防火墙和更新方法见
[在 Linux 上运行节点](../operate/node.md)。全部命令收录于
[CLI 参考](../reference/cli.md)。
