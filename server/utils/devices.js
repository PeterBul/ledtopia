import WebSocket from "ws";
import { database } from "./db.js";

export const wss = new WebSocket.Server({ port: 81 });

export let allDevices = [];

const modeMap = {
  SIMPLE: 0,
  PULSE: 1,
  RAINBOW: 2,
  BOUNCE: 3,
};

wss.on("connection", function connection(ws, req) {
  const id = req.socket.remoteAddress.replace("::ffff:", "");
  const ip = id;

  console.log("pushing new device with ip", ip);

  allDevices.push({ id, ip, ws });

  const light = database.get("lights").find({ deviceId: id }).value();
  if (light) {
    sendState(id, light.state);
  }

  let timeStamp = new Date();

  let interval = setInterval(() => {
    if (new Date().getTime() - timeStamp.getTime() > 5000) {
      console.log("terminating");
      allDevices = allDevices.filter((device) => device.id !== id);
      ws.terminate();
      clearInterval(interval);
    }
  }, 3000);

  ws.on("ping", function () {
    console.log("ping");
    timeStamp = new Date();
  });
});

wss.on("close", function close() {
  clearInterval(interval);
});

export async function sendState(id, state) {
  const device = allDevices.find((device) => device.id === id);
  if (!device) console.log("Could update device, as it seems to be offline");
  if (device && device.ws && device.ws.readyState === WebSocket.OPEN) {
    device.ws.send(
      JSON.stringify({
        ...state,
        mode: modeMap[state.mode],
      })
    );
  }
}
