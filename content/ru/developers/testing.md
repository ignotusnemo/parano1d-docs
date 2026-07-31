# Тестирование

ParanO(1)d использует три слоя тестов: инварианты отдельных crate,
межмодульные release-тесты и live-сценарии в новых процессах.

## Быстрые проверки

Перед локальным изменением:

```sh
cargo fmt --all -- --check
cargo check --locked --workspace --all-targets
cargo test --locked -p CHANGED_CRATE
```

Для протокольного кода добавляйте прямые зависимые crate. Изменение транзакции
обычно требует как минимум:

```sh
cargo test --locked \
  -p noid_tx \
  -p noid_chain \
  -p noid_mempool \
  -p noid_miner \
  -p noid_rpc \
  -p noid_node
```

## Proof-kernel

Тесты рабочих kernel запускаются в release-режиме:

```sh
cargo test --locked --release \
  -p noid_core \
  -p noid_poseidon2b \
  -p noid-ivc-core
```

На x86-64 принудительно проверьте минимальный рабочий backend:

```sh
NOID_CPU_BACKEND=pclmul \
  cargo test --locked --release \
  -p noid_core -p noid_poseidon2b -p noid-ivc-core
```

Скалярный backend используется только для дифференциальной проверки:

```sh
NOID_CPU_BACKEND=scalar \
  cargo test --locked --release \
  -p noid_core -p noid_poseidon2b
```

## Release gates

`scripts/build_release.sh` аутентифицирует канонический pack матриц, встраивает
его, выполняет нативный release-suite и smoke-тестирует:

- preflight оборудования;
- справку узла и границу запуска;
- CLI;
- внешний майнер;
- self-check упакованного GUI.

Debug-бинарник или development-узел без pack не является тестом производства
блоков.

## Live-сценарии

Live-скрипты создают чистые каталоги под `target/live-tests`. Они запускают
настоящие процессы, RPC, P2P, MDBX и рабочий proof-path.

| Сценарий | Покрытие |
|---|---|
| `live_single_transaction_scenario.py` | Кошелёк → mempool → майнер → канонический блок |
| `live_multi_transaction_mempool_scenario.py` | Три непротиворечивых intent и ретрансляция |
| `live_large_mempool_single_miner_scenario.py` | Обработка 128 intent блоками B64 |
| `live_large_mempool_two_miners_scenario.py` | Большой mempool при конкуренции майнеров |
| `live_two_miner_fork_reorg_scenario.py` | Конкурирующие потомки и неглубокая реорганизация |
| `live_connected_miner_restart_sync_scenario.py` | Перезапуск майнеров и защита от устаревшего родителя |
| `live_mining_peer_gate_scenario.py` | Обычный кворум пиров |
| `live_sync_scenarios.py` | Чистая синхронизация и границы 5/19 блоков |
| `live_incremental_snapshot_scenario.py` | Полная и инкрементальная публикация снимка |
| `live_sync_announced_tip_scenario.py` | Догоняющая синхронизация до объявленной вершины |
| `live_state_restart_scenario.py` | Перезапуск компактного состояния и первый новый блок |
| `live_state_slot_lifecycle_scenario.py` | Очистка, повторное использование, плотность и перезапуск слотов |
| `live_receipt_lifecycle_scenario.py` | Сохранение, подмена, перезапуск и проверка чека после удаления тела |
| `live_wallet_active_address_scenario.py` | Создание, пополнение, активация и сохранение владельцев |
| `live_wallet_mining_payout_switch_scenario.py` | Атомарная смена владельца выплаты |
| `live_wallet_receive_online_scenario.py` | Инкрементальное обновление получателя онлайн |
| `live_wallet_receive_offline_shallow_scenario.py` | Восстановление получателя по сохранённым блокам |
| `live_wallet_receive_offline_snapshot_scenario.py` | Восстановление получателя через snapshot-синхронизацию |
| `live_slot_mempool_wallet_scenarios.py` | Salted-подсказки, отправки между узлами и сходимость |
| `live_p2p_identity_handshake_scenario.py` | Постоянный peer ID и симметричный handshake |
| `live_p2p_fan_in_scenario.py` | Нагрузка параллельных входящих handshake |
| `live_p2p_inbound_sybil_scenario.py` | Лимит входящих соединений на IP |
| `live_p2p_outbound_diversity_scenario.py` | Разнообразие сетевых групп исходящих пиров |
| `live_p2p_mesh_block_scenario.py` | Ретрансляция блока за пределы предпочтительной mesh |

В начале каждого скрипта описаны переменные окружения и ожидаемые бинарники.
Запускайте из корня репозитория:

```sh
python3 scripts/live_two_miner_fork_reorg_scenario.py
```

## Изменения на границах

Изменения рядом с финальностью, эпохами и расширением состояния требуют
отдельных граничных векторов, а не только длинного happy path. Покрывайте:

- высоты 143, 144 и 145 для анкеров транзакций;
- глубину fork 17 и 18 блоков;
- разрыв синхронизации 18 и 19 блоков;
- финализированные окна расширения с заполнением 9/9 и 10/8;
- перезапуск с полным 36-заголовочным lookback расширения;
- границы выплат и последнюю высоту allocation;
- расширение состояния с одного уровня `log_slots` на следующий.

Тесты должны использовать изолированные каталоги. Для параллельного запуска
они могут использовать разные порты, но не должны менять fixture или рабочие
данные.
