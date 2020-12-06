import WebSocket from "ws";
import arpScanner from "arpscan/promise.js";
import isPortReachable from "is-port-reachable";

const modeMap = {
  SIMPLE: 0,
  PULSE: 1,
  RAINBOW: 2,
  BOUNCE: 3,
};

// Find all local devices and try to connect to them
export let allDevices = [];

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

export function createConnection(device) {
  console.log("trying to setup web sockets on ip:", device.ip);
  const ws = new WebSocket("ws://" + device.ip + ":81/");
  ws.on("open", () => {
    console.log("open");

    ws.on("ping", () => {
      console.log("ping");
    });

    ws.on("pong", () => {
      console.log("pong");
    });
  });

  ws.on("close", () => {
    console.log("disconnected");
  });

  ws.on("error", (err) => {
    console.log("Ws error", err);
  });

  return ws;
}

export function setupConnections(devices) {
  allDevices = devices.map((device) => ({
    ...device,
    ws: createConnection(device),
  }));
}

export async function initDevices() {
  const devices = await getLocalDevices();
  setupConnections(devices);
}

export async function sendState(mac, state) {
  const device = allDevices.find((d) => d.mac === mac);
  if (device.ws) {
    device.ws.send(
      JSON.stringify({
        ...state,
        mode: modeMap[state.mode],
      })
    );
  } else {
    console.log("couldnt find socket");
  }
}
