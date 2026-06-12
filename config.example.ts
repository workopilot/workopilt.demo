export const demoConfig = {
  /**
   * 喔壳平台 API 地址。
   * 示例: https://wiseai.example.com
   */
  API_BASE_URL: 'https://your-wiseai-domain',

  /**
   * Demo 用 APIKEY。
   * 仅建议用于本地演示或开发环境。
   * 生产环境请改为后端代理或短期 token。
   */
  API_KEY: 'replace-with-your-api-key',

  /**
   * 数字员工 iframe 嵌入地址。
   * 示例: https://wiseai.example.com/embed/chat/sales_assistant?token=xxx&externalUserId=demo-user
   */
  ROBOT_EMBED_URL: 'https://your-wiseai-domain/embed/chat/your-robot-code',

  /**
   * 是否使用本地 Mock 数据。
   * true: 页面不请求真实接口。
   * false: 页面按 API_BASE_URL + API_KEY 调用真实或代理接口。
   */
  MOCK_ENABLED: true,

  /**
   * iframe 消息协议允许的来源。
   * 开发环境可使用 '*', 生产环境应设置为喔壳平台 origin。
   */
  IFRAME_TARGET_ORIGIN: '*',
} as const;
