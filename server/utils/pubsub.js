import { PubSub } from "apollo-server";

export const LIGHT_ADDED = "LIGHT_ADDED";
export const LIGHT_REMOVED = "LIGHT_REMOVED";
export const LIGHT_UPDATED = "LIGHT_UPDATED";
export const DEVICES_UPDATED = "DEVICES_UPDATED";

const pub = new PubSub();

export const pubsub = pub;
