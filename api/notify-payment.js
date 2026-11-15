export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const webhook = process.env.DISCORD_WEBHOOK_URL;

  if (!webhook) {
    return res.status(500).json({ error: "Webhook non configuré" });
  }

  const { product, payment } = req.body || {};

  try {
    const response = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: `🛒 Nouvelle commande Kizawa\nProduit : ${product || "Non précisé"}\nPaiement choisi : ${payment || "Non précisé"}\n⚠️ Paiement non confirmé.`
      })
    });

    if (!response.ok) {
      return res.status(502).json({ error: "Erreur Discord" });
    }

    return res.status(200).json({ success: true });
  } catch {
    return res.status(500).json({ error: "Erreur serveur" });
  }
}
