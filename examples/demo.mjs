// Objectif : montrer une décision sémantique avec des données entièrement synthétiques.
import assert from "node:assert/strict";
import { reviewTreatmentRecord } from "../src/index.mjs";
import { createFakeProvider } from "../src/jev.mjs";
const dossier = {
  "id": "exemple-1",
  "text": "Traitement herbicide sur blé tendre, produit et dose par hectare indiqués, campagne et cible documentées.",
  "source": {
    "url": "https://example.test/source-publique",
    "date": "2026-09-25"
  },
  "details": {
    "territoire": "Commune Exemple",
    "origine": "donnée synthétique"
  }
};
const provider = createFakeProvider(() => ({ model: "jev-1.13.0", answers: { decision: { type: "choice", choice: "ready_for_calculation", probabilities: {
  "ready_for_calculation": 0.82,
  "ambiguous_reference": 0.06,
  "incomplete": 0.06,
  "no_treatment": 0.06
}, confidence: 0.82 } }, usage: { input_tokens: 120, output_tokens: 0 } }));
const résultat = await reviewTreatmentRecord(dossier, provider);
assert.equal(résultat.decision, "ready_for_calculation");
assert.equal(résultat.review, false);
assert.equal(provider.calls, 1);
console.log(`Décision : ${résultat.label} · probabilité : ${résultat.probability}`);
