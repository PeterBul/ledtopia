import { IState } from "@baklavajs/core/dist/baklavajs-core/types";
import { Flow } from "../flows/Flow.js";
import { sendState } from "../utils/devices.js";
import { addControllerNodes } from "../flows/nodes/utils/addControllerNodes.js";
import { IController } from "../interfaces/IController";
import { database } from "../utils/db.js";

function nullToUndefined<T>(value: T) {
  if (value === null) {
    return undefined;
  }
  return value;
}

type LightId = string;
type FlowId = string;

class FlowService {
  private flows: Record<FlowId, Flow> = {};

  private lightSubscriptions: Record<LightId, symbol[]> = {};

  addFlow(id: string, name: string | undefined, state: IState) {
    if (this.flows[id]) {
      throw new Error(`Flow with id ${id} already exists`);
    }
    this.flows[id] = new Flow(name, state);
  }

  updateFlow(id: string, state: IState) {
    if (!this.flows[id]) {
      throw new Error(`Flow with id ${id} does not exist`);
    }
    this.flows[id].update(state);
  }

  removeFlow(id: string) {
    if (!this.flows[id]) {
      throw new Error(
        `Could not remove flow. Flow with id ${id} does not exist`
      );
    }
    this.flows[id].destroy();
    delete this.flows[id];
  }

  updateFlowOptionValues(
    controllerName: string,
    options: Record<string, number>
  ) {
    Object.values(this.flows).forEach((flow) => {
      flow.updateOptionValues(controllerName, options);
    });
  }

  subscribeLight(lightId: string, flowId: string) {
    const token = Symbol(lightId);
    if (!this.lightSubscriptions[lightId]) {
      this.lightSubscriptions[lightId] = [];
    }
    this.lightSubscriptions[lightId].push(token);
    if (!this.flows[flowId]) {
      console.log(`Flow with id ${flowId} does not exist`);
      return;
    }
    const light = database.get("lights").find({ id: lightId }).value();
    if (!light) {
      return;
    }
    console.log(`Subscribing to flow ${flowId} for light ${lightId}`);
    this.flows[flowId].addListener(token, (output) => {
      sendState(light.deviceId, {
        mode: output.mode ?? "SIMPLE",
        on: output.on ?? true,
        hue: nullToUndefined(output.hue) ?? 0,
        brightness: nullToUndefined(output.brightness) ?? 255,
        saturation: nullToUndefined(output.saturation) ?? 255,
        pulseSpeed: nullToUndefined(output.pulseSpeed) ?? 100,
        rainbowSpeed: nullToUndefined(output.rainbowSpeed) ?? 100,
      });
    });
  }

  unsubscribeLight(lightId: string, flowId?: string) {
    if (!this.lightSubscriptions[lightId]) {
      return;
    }
    this.lightSubscriptions[lightId].forEach((token) => {
      if (flowId) {
        this.flows[flowId].removeListener(token);
      } else {
        Object.values(this.flows).forEach((flow) => {
          flow.removeListener(token);
        });
      }
    });
    delete this.lightSubscriptions[lightId];
  }

  addControllerNode(controller: IController) {
    Object.values(this.flows).forEach((flow) => {
      flow.addNewControllerNode(controller);
    });
  }

  rebuildFlowsContainingController(controller: IController) {
    console.log("Rebuilding flows containing controller", controller);
    Object.values(this.flows).forEach((flow) => {
      if (flow.hasControllerNode(controller)) {
        flow.rebuildEditor();
      }
    });
  }
}

export const flowService = new FlowService();
