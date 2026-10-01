// Objectif : implémenter la frontière de décision métier propre au dépôt.
import { readFile } from "node:fs/promises";
export const DECISIONS = Object.freeze({
  "ready_for_calculation": "prêt_pour_calcul",
  "ambiguous_reference": "référence_ambiguë",
  "incomplete": "incomplet",
  "no_treatment": "aucun_traitement"
});
const CRITERIA = Object.freeze({
  "ready_for_calculation": "prêt pour calcul",
  "ambiguous_reference": "référence ambiguë",
  "incomplete": "incomplet",
  "no_treatment": "aucun traitement"
});
export function treatmentCase(input) {
  if (!input?.id || !input?.text || !input?.source?.url || !input?.source?.date) throw new TypeError("Le dossier exige id, text, source.url et source.date");
  const date = new Date(input.source.date);
  if (Number.isNaN(date.valueOf())) throw new TypeError("source.date doit être une date ISO valide");
  return { ...input, id: String(input.id), text: String(input.text).trim(), source: { url: String(input.source.url), date: date.toISOString() } };
}
export async function reviewTreatmentRecord(input, provider) {
  const record = treatmentCase(input);
  if (record.treatmentStatus === "none") return { decision: "no_treatment", label: DECISIONS["no_treatment"], probability: 1, review: false, deterministic: true };
  const response = await provider.decide({
    state: record,
    questions: { decision: { type: "choice", instructions: "Analysez ce enregistrement de traitement à partir des seuls éléments sourcés. Choisissez la catégorie la plus prudente. N’inventez ni fait, ni droit applicable, ni garantie.", criteria: CRITERIA } },
  });
  const answer = response.answers.decision;
  return { decision: answer.choice, label: DECISIONS[answer.choice], probability: answer.probabilities[answer.choice], confidence: answer.confidence, review: answer.confidence < 0.8, deterministic: false, usage: response.usage };
}
export async function runCli(argv, io = console) {
  if (argv.length !== 1) throw new Error("Usage : jev-ift-record-review <dossier.json>");
  const dossier = treatmentCase(JSON.parse(await readFile(argv[0], "utf8")));
  io.log(JSON.stringify({ dossier, prochaineÉtape: "Transmettez ce dossier à reviewTreatmentRecord avec un fournisseur Jev configuré." }, null, 2));
}
