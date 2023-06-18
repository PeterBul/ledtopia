import low from "lowdb";
import { AdapterSync } from "lowdb";
import FileSync from "lowdb/adapters/FileSync.js";
import { ILight } from "../interfaces/ILight.js";
import { Flow } from "../flows/Flow.js";
import { IController } from "../interfaces/IController.js";
import { IEnum } from "../interfaces/IEnum.js";
import { IState } from "@baklavajs/core/dist/baklavajs-core/types/index.js";
import { flowService } from "../services/FlowService.js";

interface IDatabaseState {
  lights: ILight[];
  enums: IEnum[];
  flows: { id: string; name?: string; data: IState | null }[];
  controllers: IController[];
  scenes: { id: string; name: string }[];
}

const adapter: AdapterSync<IDatabaseState> = new FileSync("db.json");

export const database = low(adapter);

export type IDatabase = typeof database;

export const flows: Flow[] = [];

database
  .defaults({
    lights: [],
    devices: {},
    scenes: [],
    controllers: [],
    enums: [],
    flows: [],
  })
  .write();

database
  .get("flows")
  .value()
  .forEach(({ id, name, data }) => {
    if (!data) {
      console.log(`Flow data for ${name} is null`);
      return;
    }
    flowService.addFlow(id, name, data);
  });

database
  .get("lights")
  .value()
  .forEach(({ id, flowId }) => {
    if (!flowId) {
      return;
    }
    console.log(`Subscribing light ${id} to flow ${flowId}`);
    flowService.subscribeLight(id, flowId);
  });
