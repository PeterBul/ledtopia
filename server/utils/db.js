import low from "lowdb";
import FileSync from "lowdb/adapters/FileSync.js";

const adapter = new FileSync("db.json");
export const database = low(adapter);

database.defaults({ lights: [], devices: {}, scenes: [] }).write();
