export const PLATFORM_CONFIG_STORAGE_KEY = 'wise.demo.platform-config';
export const DEFAULT_BASE_URL = 'https://agent.workopilot.com';
export const DEFAULT_ROBOT_EMBED_URL =
  'https://agent.workopilot.com/embed/chat/2064534666530131968?token=e9c740e620374569a9fd445ff5af1e39&externalUserId={userId}&externalUserName={userName}';
export const DEFAULT_DEVICE_ROBOT_EMBED_URL = DEFAULT_ROBOT_EMBED_URL;

export interface PlatformConfig {
  apiKey: string;
  baseUrl: string;
  robotEmbedUrl: string;
  deviceRobotEmbedUrl: string;
}

export function loadPlatformConfig(): PlatformConfig {
  if (typeof window === 'undefined') {
    return {
      apiKey: '',
      baseUrl: DEFAULT_BASE_URL,
      robotEmbedUrl: DEFAULT_ROBOT_EMBED_URL,
      deviceRobotEmbedUrl: DEFAULT_DEVICE_ROBOT_EMBED_URL,
    };
  }

  const raw = window.localStorage.getItem(PLATFORM_CONFIG_STORAGE_KEY);
  if (!raw) {
    return {
      apiKey: '',
      baseUrl: DEFAULT_BASE_URL,
      robotEmbedUrl: DEFAULT_ROBOT_EMBED_URL,
      deviceRobotEmbedUrl: DEFAULT_DEVICE_ROBOT_EMBED_URL,
    };
  }

  try {
    const parsed = JSON.parse(raw) as Partial<PlatformConfig>;
    return {
      apiKey: parsed.apiKey ?? '',
      baseUrl: parsed.baseUrl || DEFAULT_BASE_URL,
      robotEmbedUrl: parsed.robotEmbedUrl ?? DEFAULT_ROBOT_EMBED_URL,
      deviceRobotEmbedUrl: parsed.deviceRobotEmbedUrl ?? DEFAULT_DEVICE_ROBOT_EMBED_URL,
    };
  } catch {
    return {
      apiKey: '',
      baseUrl: DEFAULT_BASE_URL,
      robotEmbedUrl: DEFAULT_ROBOT_EMBED_URL,
      deviceRobotEmbedUrl: DEFAULT_DEVICE_ROBOT_EMBED_URL,
    };
  }
}

export function savePlatformConfig(config: PlatformConfig) {
  window.localStorage.setItem(
    PLATFORM_CONFIG_STORAGE_KEY,
    JSON.stringify({
        apiKey: config.apiKey.trim(),
        baseUrl: (config.baseUrl || DEFAULT_BASE_URL).trim(),
        robotEmbedUrl: config.robotEmbedUrl.trim(),
        deviceRobotEmbedUrl: config.deviceRobotEmbedUrl.trim(),
      }),
  );
}

export function normalizeWiseBaseUrl(baseUrl: string) {
  let normalized = (baseUrl || DEFAULT_BASE_URL).trim();
  while (normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1);
  }
  if (normalized === 'https://agent.workopilot.com') {
    return '';
  }
  return normalized;
}
