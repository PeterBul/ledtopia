import low from "lowdb";
import { AdapterSync } from "lowdb";
import FileSync from "lowdb/adapters/FileSync.js";
import { ILight } from "../interfaces/ILight.js";

interface IDatabase {
  lights: ILight[];
  enums: IEnum[];
  flows: { id: string; name?: string; data: Object | null };
}

interface IEnum {
  id: string;
  name: string;
  values: string[];
}

const adapter: AdapterSync<IDatabase> = new FileSync("db.json");
export const database = low(adapter);

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
