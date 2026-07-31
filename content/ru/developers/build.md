# Сборка из исходного кода

Workspace использует Rust 2021 и зафиксированную версию Rust `1.96.0`.
Нативные зависимости нужны для MDBX, кода доказательств и упаковки GUI.

## Требования к машине

На всех платформах необходимы:

- зафиксированный Rust toolchain с `rustfmt`;
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

## Проверка workspace

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

Такие бинарники проверяют парсинг, UI и нерабочие тестовые пути. Для
производства блоков release-бинарнику нужен аутентифицированный pack матриц
HistoryStep, описанный ниже.

## Создание proof pack

Канонический pack содержит:

```text
v1/history-step.runtime
v1/history-step-c00.field-r1cs.zst
v1/history-step-c01.field-r1cs.zst
pins.env
SHA256SUMS
```

Сгенерируйте матрицы B64 и B255 по честным fixture:

```sh
mkdir -p ../parano1d-artifacts
./scripts/generate_history_step_pack.sh \
  ../parano1d-artifacts/history-step-pack-v1
```

Генерация ресурсоёмка и нужна один раз, пока relation не меняется. Храните
pack вне `target/`.

Скрипт пишет во временный каталог, выводит семантические pins,
аутентифицирует каждый артефакт и атомарно публикует готовый каталог. Он
откажется перезаписывать существующий путь.

## Сборка нативных поставок

```sh
./scripts/build_release.sh \
  --pack ../parano1d-artifacts/history-step-pack-v1
```

Скрипт:

1. аутентифицирует pack и выводит его pins;
2. проверяет форматирование и весь workspace;
3. встраивает runtime-метаданные и обе матрицы в узел;
4. собирает Core, внешний майнер и GUI;
5. запускает нативные релизные тесты;
6. выполняет smoke-тест каждого исполняемого файла;
7. упаковывает архив Core и нативный установщик GUI;
8. проверяет состав архивов и записывает SHA-256.

Путь к результату:

```sh
cat target/release-builds/LAST_RELEASE
```

Параметр `--output PATH` задаёт новый каталог результата. `--skip-tests`
предназначен для платформенного задания упаковки, если эта же ревизия уже
прошла полные release gates; в независимой релизной сборке его использовать
нельзя.

## Переносимые бинарники

Релизы x86-64 собираются для переносимого процессорного baseline. После
проверки машины runtime-dispatch выбирает PCLMULQDQ, AVX2 с VPCLMULQDQ или
AVX-512. На ARM64 выбирается NEON с PMULL.

Не собирайте официальные артефакты с `target-cpu=native`: бинарник начнёт
зависеть от машины сборки ещё до запуска runtime-проверки оборудования.

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

GUI-пакет содержит только приложение и его приватный узел. Операторский CLI и
инструменты внешнего майнинга в него не входят.
