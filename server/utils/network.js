import arpScanner from "arpscan/promise.js";
import isPortReachable from "is-port-reachable";

export async function getLocalDevices() {
  try {
    const localDevices = await arpScanner();
    const devices = await Promise.all(
      localDevices.map(async (device) => {
        const isReachable = await isPortReachable(81, { host: device.ip });
        return { ...device, isReachable };
      })
    );
    return devices.filter((d) => d.isReachable);
  } catch (e) {
    throw new Error(e);
  }
}
