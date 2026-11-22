/**
 * Amplitude Unified SDK bootstrap (browser only).
 * API key: 0fb41f6b8545d79dd693fac3e7c589b5
 */
const API_KEY = "0fb41f6b8545d79dd693fac3e7c589b5";

type Props = Record<string, unknown>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let ready: Promise<any> | null = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function initAmplitude(): Promise<any> | null {
  if (typeof window === "undefined") return null;
  if (!ready) {
    ready = (async () => {
      const amplitude = await import("@amplitude/unified");
      const { plugin: engagementPlugin } = await import("@amplitude/engagement-browser");
      amplitude.initAll(API_KEY, {
        analytics: { autocapture: true },
        sessionReplay: { sampleRate: 1 },
      });
      amplitude.add(engagementPlugin());
      if (typeof window !== "undefined") {
        // Expose for the Agent Chat widget (device_id / session_id stitching).
        (window as unknown as Record<string, unknown>).amplitude = amplitude;
        (window as unknown as Record<string, unknown>).AMPLI_API_KEY = API_KEY;
      }
      return amplitude;
    })();
  }
  return ready;
}

export function track(eventName: string, props?: Props) {
  const p = initAmplitude();
  if (!p) return;
  // eslint-disable-next-line no-console
  console.info("[amplitude] track", eventName, props ?? {});
  p.then((a) => a.track(eventName, props)).catch(() => {});
}

export function identifyUser(properties: Props) {
  const p = initAmplitude();
  if (!p) return;
  // eslint-disable-next-line no-console
  console.info("[amplitude] identify", properties);
  p.then((a) => {
    const id = new a.Identify();
    Object.entries(properties).forEach(([k, v]) => id.set(k, v as never));
    a.identify(id);
  }).catch(() => {});
}

export function setGroup(groupType: string, groupName: string) {
  const p = initAmplitude();
  if (!p) return;
  // eslint-disable-next-line no-console
  console.info("[amplitude] setGroup", groupType, groupName);
  p.then((a) => a.setGroup(groupType, groupName)).catch(() => {});
}
