# Wallet

The native wallet is a full-node application. It derives addresses, proves
spending authority, submits transactions, follows Live State, verifies blocks
and stores payment receipts on the same device.

Its bundled node is a private application component. The wallet starts it
without a terminal, communicates through local RPC and shuts it down cleanly
when the application exits.

![ParanO(1)d wallet main screen](../assets/wallet/main.png)

Screenshots of populated wallet pages use the built-in preview dataset.
Addresses, balances, blocks and transaction identifiers shown in them are
illustrative.

## Navigation

| Key | Section | Purpose |
|---|---|---|
| `F1` | Main | Active address, balances, UTXOs and Live State map |
| `F2` | Addresses | Derived addresses and active-owner selection |
| `F3` | Send | Build, prove and submit a payment |
| `F4` | Receipts | Saved outgoing receipts and independent verification |
| `F5` | Mining | Internal miner controls and mined blocks |
| `F6` | Scope | Search current State, blocks and retained transactions |
| `F7` | Settings | Secret, node, network and interface controls |
| `F10` | Quit | Stop the supervised node and close |

`Esc` returns from detail views and closes dialogs.

## The active address

One derived address is active at a time. It supplies:

- the owner used for a new payment's inputs;
- the address that receives change;
- the default internal-mining payout.

The wallet still scans and displays generated inactive addresses. It does not
silently combine their UTXOs into a payment from the active address.

## Local proving

When **Proof & Send** is selected, the form locks while the wallet constructs a
fresh authorization capsule. Mining CPU work yields to the local operation.
The secret never enters a transaction field or leaves the wallet process.

After successful submission, the final panel reports the logical transaction
ID and public payment facts. Confirmation is tracked by the node and the
wallet later saves a receipt.

## Local data

The default data directory is:

```text
~/.parano1d/data
```

on Linux and macOS, and the equivalent `.parano1d\data` directory under the
Windows user profile.

The master secret is stored in `wallet.key`. Saved receipts are stored in
`wallet.receipts`. Interface preferences are in
`~/.parano1d/gui-settings.json`.

The master-secret file is not password-encrypted. Protect the operating-system
account and back up the secret before receiving funds.

Start with [First run](first-run.md), learn how a
[photo can become the wallet key](photo-key.md), or jump to
[Backup and recovery](backup-recovery.md).
