/**
 * Bridge for opening the formula modal from Mathematics extension onClick.
 * The Editor component registers its opener on mount; config.ts uses this to
 * open the modal when user clicks an existing math node.
 */
export type FormulaModalPayload = {
  latex: string;
  pos: number;
  type: "inline" | "block";
};

type FormulaModalOpener = (payload: FormulaModalPayload) => void;

let opener: FormulaModalOpener | null = null;

export function setFormulaModalOpener(fn: FormulaModalOpener | null) {
  opener = fn;
}

export function openFormulaModalForEdit(payload: FormulaModalPayload) {
  if (!opener) {
    console.warn(
      "[formula-modal-store] openFormulaModalForEdit called but no opener is registered.",
    );
    return;
  }
  opener(payload);
}
