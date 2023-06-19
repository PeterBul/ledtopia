import WebSocket from "ws";
import { database } from "./db.js";
import { pubsub, DEVICES_UPDATED } from "./pubsub.js";
import { ILightState } from "../interfaces/ILight.js";
import { flowService } from "../services/FlowService.js";
import { e_FieldType } from "../interfaces/IController.js";

export const wss = new WebSocket.Server({ port: 8000 });

interface IDevice {
  id: string | undefined;
  ip: string | undefined;
  ws: WebSocket;
}

export let allDevices: IDevice[] = [];

const modeMap = {
  SIMPLE: 0,
  PULSE: 1,
  RAINBOW: 2,
  BOUNCE: 3,
};

let interval: NodeJS.Timer;

wss.on("connection", function connection(ws, req) {
  const id = req.socket.remoteAddress?.replace("::ffff:", "");
  const ip = id;

  console.log(`${ip} is trying to connect`);

  allDevices.push({ id, ip, ws });
  pubsub.publish(DEVICES_UPDATED, { devicesUpdated: allDevices });

  // @ts-ignore
  const light = database.get("lights").find({ deviceId: id }).value();
  if (id && light) {
    sendState(id, light.state);
  }

  let timeStamp = new Date();
  let noHeartbeat = false;

  interval = setInterval(() => {
    if (!noHeartbeat) {
      const timestampTime = timeStamp.getTime();
      const now = new Date().getTime();
      if (now - timestampTime > 4000) {
        console.log(`terminating ${ip}`);
        allDevices = allDevices.filter((device) => device.id !== id);
        pubsub.publish(DEVICES_UPDATED, { devicesUpdated: allDevices });
        // console.log("publishing");
        ws.terminate();
        clearInterval(interval);
      }
    }
  }, 2000);

  ws.on("ping", function () {
    timeStamp = new Date();
  });

  ws.on("message", function incoming(message) {
    // console.log("received: %s", message);
    if (message === "noheartbeat") {
      noHeartbeat = true;
      return;
    } else if (message === "heartbeat") {
      noHeartbeat = false;
      return;
    }
    const controller = database
      .get("controllers")
      .find({ deviceId: id })
      .value();
    try {
      const data = JSON.parse(message.toString());
      if (!controller) {
        console.log("No controller found");
        return;
      }
      const advancedFields = Object.fromEntries(
        controller.advancedFields.map((field) => [field.name, field])
      );
      if (
        controller.controlMode === "ADVANCED" &&
        typeof data === "object" &&
        data !== null
      ) {
        const options = Object.fromEntries(
          Object.entries(data).filter((entry): entry is [string, number] => {
            const [name, value] = entry;
            const field = advancedFields[name];
            if (!field) {
              return false;
            }
            if (typeof value !== "number") {
              return false;
            }
            if (field.type === e_FieldType.ENUM) {
              const enumId = field.value;
              if (!enumId) {
                return false;
              }
              const enumm = database.get("enums").find({ id: enumId }).value();
              if (!enumm) {
                return false;
              }
              if (value < 0 || value >= enumm.values.length) {
                console.log(
                  `Controller ${
                    controller.name
                  } sent invalid value for enum field ${name}.
Value: ${value} is outside the range: 0 - ${enumm.values.length - 1}`
                );
                return false;
              }
            }
            return true;
          })
        );
        flowService.updateFlowOptionValues(controller.name, options);
      }
    } catch (e) {
      if (e instanceof SyntaxError) {
        // console.log("Received non-json string: %s", message);
      } else {
        throw e;
      }
    }
  });
});

wss.on("close", function close() {
  clearInterval(interval);
});

export async function sendState(deviceId: string, state: Partial<ILightState>) {
  const device = allDevices.find((device) => device.id === deviceId);
  if (!device) {
    // console.log(
    //   `Could not update device with id "${deviceId}", as it seems to be offline`
    // );
    return;
  }
  if (device.ws && device.ws.readyState === WebSocket.OPEN) {
    if (!state) return;
    // TODO: Arduino cant deal with undefined values, so we need to send all values.
    device.ws.send(
      JSON.stringify({
        m: state.mode && modeMap[state.mode],
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
