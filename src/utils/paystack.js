import ApiError from "./apiError.js";

const PAYSTACK_BASE_URL = "https://api.paystack.co";

function ensurePaystackSecret() {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;

  if (!secretKey) {
    throw new ApiError(503, "Paystack is not configured yet.");
  }

  return secretKey;
}

async function paystackRequest(path, options = {}) {
  const secretKey = ensurePaystackSecret();
  const response = await fetch(`${PAYSTACK_BASE_URL}${path}`, {
    method: options.method || "GET",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const payload = await response.json();

  if (!response.ok || payload.status === false) {
    throw new ApiError(response.status || 500, payload.message || "Paystack request failed.");
  }

  return payload.data;
}

export async function initializePaystackTransaction(payload) {
  return paystackRequest("/transaction/initialize", {
    method: "POST",
    body: payload,
  });
}

export async function verifyPaystackTransaction(reference) {
  return paystackRequest(`/transaction/verify/${reference}`);
}
