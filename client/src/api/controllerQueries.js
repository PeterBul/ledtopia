import { subscribeData } from "./getData";
import {
  CONTROLLER_ADDED,
  CONTROLLER_REMOVED,
  CONTROLLER_UPDATED,
} from "./queries";
export function syncControllers() {
  subscribeData({ query: CONTROLLER_ADDED }, ({ controllerAdded }) => {
    console.log("added");
    if (controllerAdded) {
      this.allControllers.push(controllerAdded);
    }
  });

  subscribeData({ query: CONTROLLER_UPDATED }, ({ controllerUpdated }) => {
    if (controllerUpdated) {
      this.allControllers = this.allControllers.map((controller) =>
        controllerUpdated.id === controller.id ? controllerUpdated : controller
      );
    }
  });

  subscribeData({ query: CONTROLLER_REMOVED }, ({ controllerRemoved }) => {
    if (controllerRemoved) {
      this.allControllers = this.allControllers.filter(
        (controller) => controllerRemoved !== controller.id
      );
    }
  });
}
