export type APCLOUDPlatform = "web" | "pwa" | "desktop" | "android" | "ios";

type CapacitorBridge = {
  isNativePlatform?: () => boolean;
  getPlatform?: () => string;
};

type APCLOUDWindow = Window & {
  __TAURI_INTERNALS__?: unknown;
  Capacitor?: CapacitorBridge;
};

export function getAPCLOUDPlatform(): APCLOUDPlatform {
  if (typeof window === "undefined") return "web";

  const runtime = window as APCLOUDWindow;

  // Tauri v2 injects this marker in its webview. Do not infer desktop from user-agent.
  if (runtime.__TAURI_INTERNALS__) return "desktop";

  const capacitor = runtime.Capacitor;
  if (capacitor?.isNativePlatform?.()) {
    const nativePlatform = capacitor.getPlatform?.();
    if (nativePlatform === "ios") return "ios";
    if (nativePlatform === "android") return "android";
  }

  const isStandalone =
    window.matchMedia?.("(display-mode: standalone)").matches === true ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;

  return isStandalone ? "pwa" : "web";
}

export function isNativeAPCLOUDPlatform(platform = getAPCLOUDPlatform()): boolean {
  return platform === "desktop" || platform === "android" || platform === "ios";
}
