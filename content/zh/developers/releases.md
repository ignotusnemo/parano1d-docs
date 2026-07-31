# 发布工程

同一源码修订为五个原生目标构建两条产品线：

- Core 压缩包：节点、CLI 和外部矿工；
- GUI 安装包：钱包应用和私有节点。

发布文件从现有的 annotated 版本标签以及一份认证 HistoryStep pack 构建。

## 支持目标

| 主机 | Core | GUI |
|---|---|---|
| Linux x86-64 | `.tar.gz` | `.deb` |
| Linux ARM64 | `.tar.gz` | `.deb` |
| Windows x86-64 | `.zip` | 安装 `.exe` |
| macOS Apple 芯片 | `.tar.gz` | `.dmg` |
| macOS Intel | `.tar.gz` | `.dmg` |

所有包均使用 `Cargo.toml` 中的 workspace 版本。

## 源码准备

创建标签前：

1. 更新 workspace 版本和发布说明；
2. 运行格式检查、workspace 检查及变更 crate 测试；
3. 运行适用的 live 场景；
4. 认证规范矩阵 pack；
5. 确认 diff 干净且每项变化都有意为之；
6. 创建 annotated `vMAJOR.MINOR.PATCH` 标签。

标签与包版本必须完全一致。

## 矩阵 pack

发布使用一个名为以下内容的归档：

```text
history-step-pack-v1.tar.gz
```

它的 SHA-256 摘要是 workflow 的显式输入。每个原生 runner 都独立解压并
认证 pack；运行时元数据和两个矩阵 leaf digest 必须等于 `pins.env`。

发布构建把这些已认证字节嵌入 `parano1d`，安装后首次启动无需下载矩阵。

## 平台验证

在带标签的 commit 上手动运行 **Platform CI** workflow。它检查：

- 可移植构建标志；
- 完整 workspace 编译；
- 原生二进制链接；
- 硬件检查行为；
- GUI self-check；
- 每种支持架构上的正式证明 kernel；
- 对不支持的旧 x86 虚拟 CPU 作出干净拒绝。

记录成功 run ID 和准确的 head commit。

## Draft release

为标签创建 GitHub draft release，并附上已认证矩阵 pack。原生 workflow
完成前不要公开。

启动 **Native Release** 时传入：

- 已存在的标签；
- 矩阵 pack SHA-256；
- 成功的 Platform CI run ID；
- `stable` 发布频道。

Preflight 要求标签经过 annotated 且版本匹配、release 仍为 draft、
Platform CI 成功修订完全一致、pack 摘要有效。

## 原生构建

每个 runner 调用：

```sh
./scripts/build_release.sh \
  --pack .release-ci/pack/history-step-pack-v1 \
  --output .release-ci/build \
  --skip-tests
```

完整源码测试已经在同一带标签修订上通过。每个 job 仍会认证 pack、编译
完整目标、执行原生 smoke test、打包两条产品线并上传到 draft。

## 发布

最终 job 从 draft 下载每个预期文件，验证矩阵 pack 摘要，生成统一的
`SHA256SUMS` 并上传，之后才公开 release。

平台文件不完整时绝不发布。

## 签名状态

打包流水线支持可选的 macOS Developer ID identity。没有项目签名凭据时，
macOS 使用 ad-hoc 应用签名，Windows 则没有 Authenticode。启用正式签名
前，用户文档必须说明首次运行警告，并要求校验 SHA-256。

## 发布后验证

公开后：

1. 按用户方式下载全部文件；
2. 验证 `SHA256SUMS`；
3. 在原生平台安装并卸载每个 GUI 包；
4. 运行 Core 硬件检查和帮助命令；
5. 用全新数据目录启动节点；
6. 检查 P2P 同步、钱包发送、收据恢复和正常关闭；
7. 将构建日志和准确的矩阵 pack 摘要与发布记录一同保存。
