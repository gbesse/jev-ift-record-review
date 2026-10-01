// Objectif : vérifier que les types publics sont importables.
import { treatmentCase, reviewTreatmentRecord } from "../src/index.mjs";
const dossier = treatmentCase({
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
});
void reviewTreatmentRecord(dossier, { decide: async () => ({}) });
