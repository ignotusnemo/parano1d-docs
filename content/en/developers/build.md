# Build from source

The workspace is Rust 2021 and pins Rust `1.96.0`. Native dependencies are
needed for MDBX, proof code and GUI packaging.

## Host requirements

All platforms need:

- the pinned Rust toolchain with `rustfmt`;
- a native C/C++ compiler;
- CMake;
- libclang;
- Git.

On Debian or Ubuntu:

```sh
sudo apt update
sudo apt install --no-install-recommends \
  build-essential clang libclang-dev cmake pkg-config
```

The Linux GUI package additionally needs `appstreamcli` and `dpkg-deb`.
Windows release packaging uses Inno Setup 6. macOS packaging uses the standard
`codesign`, `iconutil` and `hdiutil` tools.

The repository's `rust-toolchain.toml` selects the compiler automatically:

```sh
rustup show active-toolchain
rustc --version
cargo --version
```

## Check the workspace

```sh
cargo fmt --all -- --check
cargo check --locked --workspace --all-targets
```

Build ordinary development binaries:

```sh
cargo build --locked \
  -p noid_node \
  -p noid-extminer \
  -p noid_gui \
  --bins
```

Development binaries exercise parsing, UI and non-production test paths. A
block-producing release requires the authenticated HistoryStep matrix pack
described below.

## Reproduce the soundness certificate

The production calculations and proof documents are in
[`noid_soundness`](https://github.com/ignotusnemo/parano1d/tree/main/noid_soundness).

```sh
cargo run --release --locked -p noid_soundness
cargo run --release --locked -p noid_soundness -- --exact
cargo test --release --locked -p noid_soundness
```

## Generate the proof pack

The canonical pack contains:

```text
v1/history-step.runtime
v1/history-step-c00.field-r1cs.zst
v1/history-step-c01.field-r1cs.zst
pins.env
SHA256SUMS
```

Generate B25 and B255 matrices from honest fixtures:

```sh
mkdir -p ../parano1d-artifacts
./scripts/generate_history_step_pack.sh \
  ../parano1d-artifacts/history-step-pack-v1
```

Generation is expensive and only needs to be performed once for an unchanged
relation. Keep the pack outside `target/`.

The script writes to a staging directory, derives semantic pins, authenticates
every artifact and publishes the completed directory atomically. It refuses to
overwrite an existing output path.

## Build native deliverables

```sh
./scripts/build_release.sh \
  --pack ../parano1d-artifacts/history-step-pack-v1
```

The script:

1. authenticates the pack and derives its pins;
2. checks formatting and the complete workspace;
3. embeds runtime metadata and both matrices into the node;
4. builds Core, external miner and GUI;
5. runs the native release tests;
6. smoke-tests every executable;
7. packages the Core archive and native GUI installer;
8. verifies archive membership and writes SHA-256 sums.

Find the output:

```sh
cat target/release-builds/LAST_RELEASE
```

Use `--output PATH` to choose a fresh output directory. `--skip-tests` is for a
platform packaging job whose source revision has already passed the complete
release gates; it should not be used for an independent release build.

## Portable binaries

x86-64 releases are compiled against a portable process baseline. After
checking the host, runtime dispatch selects `pclmul`, `avx2+vpclmul` or
`avx512bw+vpclmul`. ARM64 selects `neon+pmull`.

Do not compile official artifacts with `target-cpu=native`. That would make the
binary depend on the build machine before runtime hardware checks can run.

## Reproducible archive details

On GNU tar hosts, `SOURCE_DATE_EPOCH` controls member timestamps and defaults
to zero. The Core archive has a fixed member set:

```text
README.txt
LICENSE
NOTICE
parano1d
parano1d-cli
parano1d-miner
```

The GUI package contains only the application and its private node. It does not
include operator CLI or external-mining tools.
