# Consolidation

Consolidation combines several UTXOs of the active address into one new UTXO
owned by that same address. It reduces future input count and releases occupied
slots.

## When it is available

The Main page offers **Consolidate** when the active address has enough
spendable outputs for the operation to be useful.

The wallet selects the smallest UTXOs first and can combine up to 64 inputs in
one interactive operation. The preview shows:

- selected input count and value;
- one same-owner output;
- network fee;
- number of slots freed;
- resulting active-owner balance.

## Proof and submission

Consolidation uses the same wallet authorization system as a payment. The
dialog locks and displays the forging animation while the proof is built and
the intent is submitted.

Because the number of outputs is smaller than the number of inputs,
consolidation has no State-growth burn. It still pays base, input and output
fees.

## No receipt

The output owner equals the input owner. The wallet records the balance change
and UTXO lifecycle but deliberately does not save a payment receipt.

This is based on the exact transaction owner relation. It does not require the
node to inspect every address that the master secret might derive.

## Choosing a time

Consolidation is optional. It is useful before a future large payment when an
address has accumulated many small outputs. The current fee preview is exact
for the current State; a change in inputs, epoch or tip may require rebuilding
the intent.
