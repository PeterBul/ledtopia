import low from "lowdb";
import { AdapterSync } from "lowdb";
import FileSync from "lowdb/adapters/FileSync.js";
import { ILight } from "../interfaces/ILight.js";

interface IDatabase {
  lights: ILight[];
}

const adapter: AdapterSync<IDatabase> = new FileSync("db.json");
export const database = low(adapter);

database
  .defaults({
    lights: [],
    devices: {},
    scenes: [],
    controlGroups: [],
    controlEntities: [],
  })
  .write();
