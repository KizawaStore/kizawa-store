
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const webhook = process.env.DISCORD_WEBHOOK_URL;

  if (!webhook) {
    return res.status(500).json({ error: "Webhook non configuré" });
  }

  const {
    product,
    payment,
    invoiceId,
    orderId,
    customerEmail,
    email,
    amount,
    createdAt
  } = req.body || {};

  // Accepte les deux noms de champs utilisés par le site
  const invoice = invoiceId || orderId || "Non précisé";
  const customer = customerEmail || email || "Non précisé";

  // Convertit les produits en texte lisible
  function formatProduct(value) {
    if (!value) return "Non précisé";

    if (Array.isArray(value)) {
      return value.map(item => {
        if (typeof item === "string") return item;

        const name = item.name || item.title || item.product || "Produit";
        const quantity = item.quantity ? ` x${item.quantity}` : "";
        return `${name}${quantity}`;
      }).join(", ");
    }

    if (typeof value === "object") {
      return value.name || value.title || JSON.stringify(value);
    }

    return String(value);
  }

  const productText = formatProduct(product);
  const date = createdAt
    ? new Date(createdAt).toLocaleString("fr-FR")
    : new Date().toLocaleString("fr-FR");

  const message = [
    "🛒 **Nouvelle commande Kizawa**",
    "",
    `🧾 **Invoice ID :** ${invoice}`,
    `📧 **Email :** ${customer}`,
    `📦 **Produit :** ${productText}`,
    `💳 **Paiement choisi :** ${payment || "Non précisé"}`,
    `💰 **Montant :** ${amount || "Non précisé"}`,
    `📅 **Date :** ${date}`,
    "",
    "⚠️ Paiement non confirmé."
  ].join("\n");

  try {
    const response = await fetch(webhook, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        content: message.slice(0, 2000),
        allowed_mentions: {
          parse: []
        }
      })
    });

    if (!response.ok) {
      return res.status(502).json({
        error: "Erreur lors de l'envoi Discord"
      });
    }

    return res.status(200).json({
      success: true
    });

  } catch (error) {
    return res.status(500).json({
      error: "Erreur serveur"
    });
  }
}
