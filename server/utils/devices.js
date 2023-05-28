import WebSocket from "ws";
import { database } from "./db.js";
import { pubsub, DEVICES_UPDATED } from "./pubsub.js";

export const wss = new WebSocket.Server({ port: 8000 });

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

  console.log("Something is trying to connect");

  allDevices.push({ id, ip, ws });
  pubsub.publish(DEVICES_UPDATED, { devicesUpdated: allDevices });

  const light = database.get("lights").find({ deviceId: id }).value();
  if (light) {
    sendState(id, light.state);
  }

  let timeStamp = new Date();

  let interval = setInterval(() => {
    if (new Date().getTime() - timeStamp.getTime() > 4000) {
      console.log("terminating");
      allDevices = allDevices.filter((device) => device.id !== id);
      pubsub.publish(DEVICES_UPDATED, { devicesUpdated: allDevices });
      console.log("publishing");
      ws.terminate();
      clearInterval(interval);
    }
  }, 2000);

  ws.on("ping", function () {
    console.log("ping");
    timeStamp = new Date();
  });

  ws.on("message", function incoming(message) {
    console.log("received: %s", message);
    ws.send("Very well");
  });
});

wss.on("close", function close() {
  clearInterval(interval);
});
/*
{
  mode: "SIMPLE",
  on: false,
  hue: 0,
  saturation: 255,
  brightness: 255,
  pulseSpeed: 200,
  rainbowSpeed: 10,
};
*/
/**
 *
 * @param {   string  } id
 * @param {{  mode: string,
 *            on: boolean,
 *            hue: number,
 *            saturation: number,
 *            brightness: number,
 *            pulseSpeed: number,
 *            rainbowSpeed: number
 *        }} state
 */
export async function sendState(id, state) {
  const device = allDevices.find((device) => device.id === id);
  if (!device) console.log("Could update device, as it seems to be offline");
  if (device && device.ws && device.ws.readyState === WebSocket.OPEN) {
    device.ws.send(
      JSON.stringify({
        m: modeMap[state.mode],
        o: state.on,
        h: state.hue,
        s: state.saturation,
        v: state.brightness,
        ps: state.pulseSpeed,
        rs: state.rainbowSpeed,
      })
    );
  }
}
