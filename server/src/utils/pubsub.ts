import { PubSub } from "apollo-server";

export const LIGHT_ADDED = "LIGHT_ADDED";
export const LIGHT_REMOVED = "LIGHT_REMOVED";
export const LIGHT_UPDATED = "LIGHT_UPDATED";
export const DEVICES_UPDATED = "DEVICES_UPDATED";
export const SCENE_ADDED = "SCENE_ADDED";
export const SCENE_REMOVED = "SCENE_REMOVED";

export const ENUM_UPDATED = "ENUM_UPDATED";
export const ENUM_REMOVED = "ENUM_REMOVED";
export const ENUM_ADDED = "ENUM_ADDED";

export const CONTROLLER_ADDED = "CONTROLLER_ADDED";
export const CONTROLLER_REMOVED = "CONTROLLER_REMOVED";
export const CONTROLLER_UPDATED = "CONTROLLER_UPDATED";

const pub = new PubSub();

export const pubsub = pub;
