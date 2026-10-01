// Objectif : effectuer un appel Jev synthétique uniquement sur demande explicite.
import { createJevClient } from "../src/jev.mjs";
import { reviewTreatmentRecord } from "../src/index.mjs";
const client = createJevClient();
const résultat = await reviewTreatmentRecord({
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
}, client);
console.log(JSON.stringify({ décision: résultat.decision, confiance: résultat.confidence, usage: résultat.usage }, null, 2));
