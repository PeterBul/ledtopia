import WebSocket from "ws";

// Find all local devices and try to connect to them
export let sockets = {};

export function setupConnections(devices) {
  devices.forEach((device) => {
    delete sockets[device.ip];
    console.log("trying to setup web sockets on ip:", device.ip);
    const ws = new WebSocket("ws://" + device.ip + ":81/");

    ws.on("open", () => {
      console.log("open");
    });

    ws.on("close", () => {
      console.log("disconnected");
      ws.terminate();
      delete sockets[device.ip];
    });
    ws.on("error", (err) => {
      console.log("Ws error", err);
      ws.terminate();
      delete sockets[device.ip];
    });

    sockets[device.ip] = ws;
  });
}
