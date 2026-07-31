# Release engineering

One source revision produces two product lines on five native targets:

- Core archive: node, CLI and external miner;
- GUI package: wallet application and private node.

Release artifacts are built from an existing annotated version tag and one
authenticated HistoryStep pack.

## Supported targets

| Host | Core | GUI |
|---|---|---|
| Linux x86-64 | `.tar.gz` | `.deb` |
| Linux ARM64 | `.tar.gz` | `.deb` |
| Windows x86-64 | `.zip` | setup `.exe` |
| macOS Apple Silicon | `.tar.gz` | `.dmg` |
| macOS Intel | `.tar.gz` | `.dmg` |

All packages use the workspace version from `Cargo.toml`.

## Source preparation

Before tagging:

1. update the workspace version and release notes;
2. run formatting, workspace checks and changed-crate tests;
3. run the applicable live scenarios;
4. authenticate the canonical matrix pack;
5. confirm a clean, intentional diff;
6. create an annotated `vMAJOR.MINOR.PATCH` tag.

The tag and package version must match exactly.

## Matrix pack

The release uses one archive named:

```text
history-step-pack-v1.tar.gz
```

Its SHA-256 digest is an explicit workflow input. The build extracts and
authenticates the pack independently on every native runner. Runtime metadata
and the two matrix leaf digests must equal the pack's `pins.env`.

The release build embeds those authenticated bytes into `parano1d`; installed
users do not download matrices at first start.

## Platform validation

Run the manual **Platform CI** workflow on the tagged commit. It checks:

- portable build flags;
- complete workspace compilation;
- native binary linking;
- hardware-check behavior;
- GUI self-check;
- production proof kernels on every supported architecture;
- clean rejection of an unsupported legacy x86 virtual CPU.

Record the successful run ID and exact head commit.

## Draft release

Create a draft GitHub release for the tag and attach the authenticated matrix
pack. Do not publish it before the native workflow completes.

Dispatch **Native Release** with:

- the existing tag;
- matrix-pack SHA-256;
- successful Platform CI run ID;
- `stable` release channel.

Preflight requires an annotated matching tag, draft release, exact successful
Platform CI revision and valid pack digest.

## Native build

Each runner calls:

```sh
./scripts/build_release.sh \
  --pack .release-ci/pack/history-step-pack-v1 \
  --output .release-ci/build \
  --skip-tests
```

The complete source tests have already passed on the same tagged revision.
Each job still authenticates the pack, compiles the full target, performs
native smoke tests, packages both product lines and uploads them to the draft.

## Publication

The final job downloads every expected artifact from the draft, verifies the
matrix-pack digest, generates one `SHA256SUMS`, uploads it, and only then opens
the release.

No partial platform set is published.

## Signing status

The packaging pipeline supports an optional macOS Developer ID identity.
Without project signing credentials, macOS uses an ad-hoc application
signature and Windows has no Authenticode signature. User documentation must
state the first-launch warnings and require SHA-256 verification until those
signing paths are enabled.

## Release verification

After publication:

1. download every artifact as a user would;
2. verify `SHA256SUMS`;
3. install and uninstall each GUI package on its native platform;
4. run Core hardware checks and help commands;
5. start a node with a fresh data directory;
6. verify P2P synchronization, wallet send, receipt recovery and clean
   shutdown;
7. preserve build logs and the exact matrix-pack digest with release records.
