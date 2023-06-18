import { IDatabase } from "./db.js";

export const getAllEnums = (db: IDatabase) => {
  return db.get("enums").value();
};

export const getAllControllers = (db: IDatabase) => {
  return db.get("controllers").value();
};
