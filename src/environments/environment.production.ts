export const environment = {
  production: true,
  apiBaseUrl: "https://shopapi.stepacademy.ge",
  n8nWebhookUrl: "https://stepproject.app.n8n.cloud/webhook-test/tech-shop-order",
  n8nChatUrl: "https://stepproject.app.n8n.cloud/webhook/f388c550-257f-41d0-aa3c-d45e4c8d626f/chat",
  apiKey: "fd722eda-6b89-4f9b-a41a-3a4dad7a3287",
  storageKeys: {
    cart: "step_tech_cart_v1",
    auth: "step_tech_auth_v1",
    orders: "step_tech_orders_v1",
  },
} as const;
