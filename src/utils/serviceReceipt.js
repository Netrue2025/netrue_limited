const formatCurrency = (value) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const formatDate = (value) =>
  new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value ? new Date(value) : new Date());

const escapeHtml = (value) =>
  `${value || ""}`
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

export function buildPaymentReceiptHtml(payment) {
  const company = payment.companySnapshot || {};

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(payment.receiptNumber || "Payment receipt")}</title>
    <style>
      * { box-sizing: border-box; }
      body { margin: 0; background: #e5e7eb; color: #0f172a; font-family: Arial, sans-serif; }
      .page { max-width: 820px; margin: 28px auto; background: #fff; border-radius: 24px; overflow: hidden; }
      .header { display: flex; justify-content: space-between; gap: 24px; padding: 36px; background: #0b3d2e; color: #fff; }
      .brand { display: flex; gap: 16px; align-items: center; }
      .logo { width: 72px; height: 72px; border-radius: 18px; object-fit: cover; background: #fff; padding: 6px; }
      h1, h2, p { margin: 0; }
      h1 { font-size: 28px; line-height: 1.1; }
      .muted { color: rgba(255,255,255,.72); margin-top: 8px; line-height: 1.55; font-size: 13px; }
      .receipt-id { text-align: right; font-size: 13px; line-height: 1.7; color: rgba(255,255,255,.82); }
      .body { padding: 36px; }
      .paid { display: flex; justify-content: space-between; gap: 24px; align-items: center; border: 1px solid #dbe4df; border-radius: 20px; padding: 22px; }
      .paid strong { display: block; margin-top: 8px; color: #e63946; font-size: 34px; }
      .badge { border-radius: 999px; background: #dcfce7; color: #166534; padding: 8px 14px; font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: .12em; }
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-top: 24px; }
      .box { border: 1px solid #e2e8f0; border-radius: 18px; padding: 20px; min-height: 120px; }
      .label { color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: .16em; font-weight: 700; margin-bottom: 9px; }
      .value { color: #0f172a; font-weight: 700; line-height: 1.5; }
      .line { display: flex; justify-content: space-between; gap: 20px; border-bottom: 1px solid #e2e8f0; padding: 14px 0; font-size: 14px; }
      .line:last-child { border-bottom: 0; }
      .note { margin-top: 24px; border-left: 4px solid #0b3d2e; background: #f8fafc; padding: 18px; color: #475569; line-height: 1.7; }
      .footer { padding: 24px 36px 34px; color: #64748b; font-size: 12px; line-height: 1.7; }
    </style>
  </head>
  <body>
    <main class="page">
      <section class="header">
        <div class="brand">
          ${company.logo ? `<img class="logo" src="${escapeHtml(company.logo)}" alt="" />` : ""}
          <div>
            <h1>${escapeHtml(company.companyName || "Netrue Limited")}</h1>
            <p class="muted">${escapeHtml(company.address || "Official service payment receipt")}</p>
            <p class="muted">${escapeHtml([company.email, company.phone, company.website].filter(Boolean).join(" | "))}</p>
          </div>
        </div>
        <div class="receipt-id">
          <p>Receipt</p>
          <h2>${escapeHtml(payment.receiptNumber || "")}</h2>
          <p>${escapeHtml(formatDate(payment.paidAt || payment.createdAt))}</p>
        </div>
      </section>
      <section class="body">
        <div class="paid">
          <div>
            <p class="label">Amount paid</p>
            <strong>${escapeHtml(formatCurrency(payment.amount))}</strong>
          </div>
          <span class="badge">Payment successful</span>
        </div>
        <div class="grid">
          <div class="box">
            <p class="label">Received from</p>
            <p class="value">${escapeHtml(payment.customerName)}</p>
            <p>${escapeHtml(payment.customerEmail)}</p>
            <p>${escapeHtml(payment.customerPhone)}</p>
          </div>
          <div class="box">
            <p class="label">Service paid for</p>
            <p class="value">${escapeHtml(payment.serviceName)}</p>
            <p>${payment.paymentType === "part" ? "Part payment" : "Full payment"}</p>
          </div>
        </div>
        <div class="box" style="margin-top: 24px;">
          <div class="line"><span>Paystack reference</span><strong>${escapeHtml(payment.paystackReference)}</strong></div>
          <div class="line"><span>Payment type</span><strong>${payment.paymentType === "part" ? "Part payment" : "Full payment"}</strong></div>
          <div class="line"><span>Expected balance</span><strong>${escapeHtml(formatCurrency(payment.expectedBalance || 0))}</strong></div>
          ${company.taxId ? `<div class="line"><span>Registration / Tax ID</span><strong>${escapeHtml(company.taxId)}</strong></div>` : ""}
        </div>
        <p class="note">${escapeHtml(company.receiptNote || "Thank you for your payment.")}</p>
      </section>
      <section class="footer">
        <p>This receipt was generated electronically after Paystack confirmed the transaction. Keep it for your records.</p>
      </section>
    </main>
  </body>
</html>`;
}

export function buildPaymentReceiptEmail(payment) {
  const note = `Thank you for making the payment for ${payment.serviceName} service, below is your attached receipt. Thank you for trusting us`;

  return {
    subject: `Payment receipt ${payment.receiptNumber}`,
    text: `${note}\n\nReceipt: ${payment.receiptNumber}\nAmount: ${formatCurrency(payment.amount)}\nService: ${payment.serviceName}\nReference: ${payment.paystackReference}`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.7;">
        <h2 style="color: #0b3d2e;">Payment receipt</h2>
        <p>${escapeHtml(note)}</p>
        <p><strong>Receipt:</strong> ${escapeHtml(payment.receiptNumber)}</p>
        <p><strong>Service:</strong> ${escapeHtml(payment.serviceName)}</p>
        <p><strong>Amount:</strong> ${escapeHtml(formatCurrency(payment.amount))}</p>
        <p><strong>Reference:</strong> ${escapeHtml(payment.paystackReference)}</p>
      </div>
    `,
  };
}
