# 从源码构建

工作区使用 Rust 2021，并固定 Rust `1.96.0`。MDBX、证明代码和 GUI
打包需要原生依赖。

## 主机要求

所有平台都需要：

- 固定版本的 Rust 工具链，以及 `rustfmt`；
- 原生 C/C++ 编译器；
- CMake；
- libclang；
- Git。

Debian 或 Ubuntu：

```sh
sudo apt update
sudo apt install --no-install-recommends \
  build-essential clang libclang-dev cmake pkg-config
```

Linux GUI 包还需要 `appstreamcli` 和 `dpkg-deb`。Windows 发布打包使用
Inno Setup 6，macOS 使用标准的 `codesign`、`iconutil` 和 `hdiutil`。

仓库中的 `rust-toolchain.toml` 会自动选择编译器：

```sh
rustup show active-toolchain
rustc --version
cargo --version
```

## 检查工作区

```sh
cargo fmt --all -- --check
cargo check --locked --workspace --all-targets
```

构建普通开发二进制：

```sh
cargo build --locked \
  -p noid_node \
  -p noid-extminer \
  -p noid_gui \
  --bins
```

开发版二进制文件可测试解析、UI 和非生产用证明路径。能够生产区块的发布版需要
下文所述经过认证的 HistoryStep 矩阵包。

## 生成证明矩阵包

规范矩阵包包含：

```text
v1/history-step.runtime
v1/history-step-c00.field-r1cs.zst
v1/history-step-c01.field-r1cs.zst
pins.env
SHA256SUMS
```

从诚实执行样例生成 B64 和 B255 矩阵：

```sh
mkdir -p ../parano1d-artifacts
./scripts/generate_history_step_pack.sh \
  ../parano1d-artifacts/history-step-pack-v1
```

生成开销很高；证明关系不变时只需执行一次。矩阵包应保存在 `target/`
之外。

脚本先写入临时目录，派生语义固定值，认证每个文件，再原子发布完整
目录。若输出路径已存在，脚本会拒绝覆盖。

## 构建原生发布物

```sh
./scripts/build_release.sh \
  --pack ../parano1d-artifacts/history-step-pack-v1
```

脚本会：

1. 认证矩阵包并派生固定值；
2. 检查格式和完整工作区；
3. 把运行时元数据和两份矩阵嵌入节点；
4. 构建 Core、外部矿工与 GUI；
5. 运行原生发布测试；
6. 对每个可执行文件做冒烟测试；
7. 打包 Core 压缩包和原生 GUI 安装程序；
8. 验证归档成员并生成 SHA-256。

查看输出路径：

```sh
cat target/release-builds/LAST_RELEASE
```

使用 `--output PATH` 可选择新的输出目录。`--skip-tests` 只适用于源码
修订已经通过完整发布门禁的平台打包任务，不应在独立发布构建中
使用。

## 可移植二进制

x86-64 版本针对可移植的指令集基线编译。检查主机后，运行时分派机制
会选择 PCLMULQDQ、带 VPCLMULQDQ 的 AVX2 或 AVX-512。ARM64 选择
NEON 与 PMULL。

发布产物不得使用 `target-cpu=native` 构建，否则二进制会在运行时硬件
检查之前就依赖构建机器。

## 可复现归档细节

在 GNU tar 主机上，`SOURCE_DATE_EPOCH` 控制成员时间戳，默认值为零。
Core 归档成员固定为：

```text
README.txt
LICENSE
NOTICE
parano1d
parano1d-cli
parano1d-miner
```

GUI 包只包含应用及其私有节点，不包含运营 CLI 或外部挖矿工具。
