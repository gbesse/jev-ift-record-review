// Objectif : vérifier la normalisation, la règle déterministe et les décisions sémantiques.
import test from "node:test";
import assert from "node:assert/strict";
import { treatmentCase, reviewTreatmentRecord } from "../src/index.mjs";
import { createFakeProvider } from "../src/jev.mjs";
const casLimite = {
  "id": "limite-1",
  "text": "Cas synthétique traité par une règle déterministe avant toute analyse sémantique.",
  "source": {
    "url": "https://example.test/cas-limite",
    "date": "2026-09-27"
  },
  "treatmentStatus": "none"
};
const casPrincipal = {
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
const casÀRevoir = {
  "id": "revue-1",
  "text": "Le carnet mentionne un désherbant sur céréales sans numéro d’autorisation ni variété de culture.",
  "source": {
    "url": "https://example.test/dossier-ambigu",
    "date": "2026-09-26"
  },
  "details": {
    "origine": "donnée synthétique",
    "signal": "informations incomplètes"
  }
};
test("exige une source", () => assert.throws(() => treatmentCase({ id: "x", text: "y" }), /source/));
test("applique le cas limite sans appel Jev", async () => {
  const provider = createFakeProvider(() => { throw new Error("appel interdit"); });
  assert.equal((await reviewTreatmentRecord(casLimite, provider)).decision, "no_treatment");
  assert.equal(provider.calls, 0);
});
test("classe un dossier sourcé avec une confiance suffisante", async () => {
  const provider = createFakeProvider(() => ({ model: "jev-1.13.0", answers: { decision: { type: "choice", choice: "ready_for_calculation", probabilities: {
  "ready_for_calculation": 0.82,
  "ambiguous_reference": 0.06,
  "incomplete": 0.06,
  "no_treatment": 0.06
}, confidence: 0.82 } }, usage: { input_tokens: 10, output_tokens: 0 } }));
  const résultat = await reviewTreatmentRecord(casPrincipal, provider);
  assert.equal(résultat.decision, "ready_for_calculation");
  assert.equal(résultat.review, false);
  assert.equal(provider.calls, 1);
});
test("marque une décision incertaine pour revue humaine", async () => {
  const provider = createFakeProvider(() => ({ model: "jev-1.13.0", answers: { decision: { type: "choice", choice: "ambiguous_reference", probabilities: {
  "ready_for_calculation": 0.16,
  "ambiguous_reference": 0.52,
  "incomplete": 0.16,
  "no_treatment": 0.16
}, confidence: 0.62 } }, usage: { input_tokens: 10, output_tokens: 0 } }));
  const résultat = await reviewTreatmentRecord(casÀRevoir, provider);
  assert.equal(résultat.decision, "ambiguous_reference");
  assert.equal(résultat.review, true);
  assert.equal(résultat.confidence, 0.62);
  assert.equal(provider.calls, 1);
});
