# Сборка из исходного кода

Рабочее пространство использует Rust 2021 и зафиксированную версию Rust `1.96.0`.
Нативные зависимости нужны для MDBX, кода доказательств и упаковки GUI.

## Требования к машине

На всех платформах необходимы:

- зафиксированный набор инструментов Rust с `rustfmt`;
- нативный компилятор C/C++;
- CMake;
- libclang;
- Git.

На Debian или Ubuntu:

```sh
sudo apt update
sudo apt install --no-install-recommends \
  build-essential clang libclang-dev cmake pkg-config
```

Для Linux-пакета GUI также нужны `appstreamcli` и `dpkg-deb`. Релизная
упаковка Windows использует Inno Setup 6, macOS — стандартные инструменты
`codesign`, `iconutil` и `hdiutil`.

Файл `rust-toolchain.toml` в репозитории автоматически выбирает компилятор:

```sh
rustup show active-toolchain
rustc --version
cargo --version
```

## Проверка рабочего пространства

```sh
cargo fmt --all -- --check
cargo check --locked --workspace --all-targets
```

Сборка обычных бинарников для разработки:

```sh
cargo build --locked \
  -p noid_node \
  -p noid-extminer \
  -p noid_gui \
  --bins
```

Такие исполняемые файлы подходят для проверки разбора данных, интерфейса и
тестовых путей, не создающих блоки. Для производства блоков бинарнику релизной
сборки нужен описанный ниже аутентифицированный пакет матриц
`HistoryStep`.

## Воспроизведение сертификата безопасности

Штатные расчёты и доказательства находятся в
[`noid_soundness`](https://github.com/ignotusnemo/parano1d/tree/main/noid_soundness).

```sh
cargo run --release --locked -p noid_soundness
cargo run --release --locked -p noid_soundness -- --exact
cargo test --release --locked -p noid_soundness
```

## Создание пакета матриц доказательства

Канонический пакет содержит:

```text
v1/history-step.runtime
v1/history-step-c00.field-r1cs.zst
v1/history-step-c01.field-r1cs.zst
pins.env
SHA256SUMS
```

Сгенерируйте матрицы B25 и B255 по корректным тестовым данным:

```sh
mkdir -p ../parano1d-artifacts
./scripts/generate_history_step_pack.sh \
  ../parano1d-artifacts/history-step-pack-v1
```

Генерация ресурсоёмка и нужна один раз, пока отношение не меняется. Храните
пакет вне `target/`.

Скрипт пишет во временный каталог, выводит семантические контрольные значения,
аутентифицирует каждый артефакт и атомарно публикует готовый каталог. Он
откажется перезаписывать существующий путь.

## Сборка нативных поставок

```sh
./scripts/build_release.sh \
  --pack ../parano1d-artifacts/history-step-pack-v1
```

Скрипт:

1. аутентифицирует пакет и выводит его контрольные значения;
2. проверяет форматирование и всё рабочее пространство;
3. встраивает метаданные времени выполнения и обе матрицы в ноду;
4. собирает Core, внешний майнер и GUI;
5. запускает нативные релизные тесты;
6. выполняет быструю проверку запуска каждого исполняемого файла;
7. упаковывает архив Core и нативный установщик GUI;
8. проверяет состав архивов и записывает SHA-256.

Путь к результату:

```sh
cat target/release-builds/LAST_RELEASE
```

Параметр `--output PATH` задаёт новый каталог результата. `--skip-tests`
предназначен для платформенного задания упаковки, если эта же ревизия уже
прошла все обязательные проверки релиза; в независимой релизной сборке его использовать
нельзя.

## Переносимые бинарники

Релизы x86-64 собираются для переносимого базового набора инструкций. После
проверки машины при запуске выбирается `pclmul`, `avx2+vpclmul` или
`avx512bw+vpclmul`. На ARM64 выбирается `neon+pmull`.

Не собирайте официальные артефакты с `target-cpu=native`: бинарник начнёт
зависеть от машины сборки ещё до проверки оборудования при запуске.

## Воспроизводимый архив

На системах с GNU tar переменная `SOURCE_DATE_EPOCH` управляет временными
метками файлов и по умолчанию равна нулю. Состав архива Core фиксирован:

```text
README.txt
LICENSE
NOTICE
parano1d
parano1d-cli
parano1d-miner
```

GUI-пакет содержит только приложение и встроенную в него ноду. Операторский CLI и
инструменты внешнего майнинга в него не входят.
