import { IEnum } from "@/interfaces/IEnum";
import type { Editor, NodeBuilder } from "@baklavajs/core";

export function addEnumNode(
  enumNodeFactory: (enumm: IEnum) => {
    name: string;
    node: ReturnType<NodeBuilder["build"]>;
  },
  allEnums: IEnum[],
  editor: Editor
) {
  allEnums
    .map((enumm) => {
      const { name, node } = enumNodeFactory(enumm);
      return { name, node };
    })
    .sort(({ name: a }, { name: b }) => a.localeCompare(b))
    .forEach(({ name, node }) => {
      editor.registerNodeType(name, node);
    });
}
