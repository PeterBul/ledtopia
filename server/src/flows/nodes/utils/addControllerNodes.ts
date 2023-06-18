import type { Editor, NodeBuilder } from "@baklavajs/core";
import { IEnum } from "../../../interfaces/IEnum.js";
import { IController } from "../../../interfaces/IController.js";

export function addControllerNodes(
  controllerNodeFactory: (
    controller: IController,
    allEnums: IEnum[]
  ) => {
    name: string;
    node: ReturnType<NodeBuilder["build"]>;
  } | null,
  allControllers: IController[],
  allEnums: IEnum[],
  editor: Editor
) {
  allControllers
    .map((controller) => {
      return controllerNodeFactory(controller, allEnums);
    })
    .filter((val): val is NonNullable<typeof val> => val !== null)
    .sort(({ name: a }, { name: b }) => a.localeCompare(b))
    .forEach(({ name, node }) => {
      editor.registerNodeType(name, node);
    });
}
