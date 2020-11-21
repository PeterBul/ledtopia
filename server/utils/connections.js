import WebSocket from "ws";

// Find all local devices and try to connect to them
export let sockets = {};

export function setupConnections(devices) {
  sockets = {};
  devices.forEach((device) => {
    const ws = new WebSocket("ws://" + device.ip + ":81/");
    sockets[device.ip] = ws;
    ws.on("open", () => {
      console.log("Opened ws");
    });
    ws.on("close", function close() {
      console.log("disconnected");
      delete sockets[device.ip];
    });
    ws.on("error", function (err) {
      console.log("Ws error", err);
      delete sockets[device.ip];
    });
  });
}
