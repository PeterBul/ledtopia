import { IEnum } from "@/interfaces/IEnum";
import { NodeBuilder } from "@baklavajs/core";

export const PickEnumNodeFactory = (enumm: IEnum) => {
  const name = `Pick ${enumm.name} Value`;
  const builder = new NodeBuilder(name)
    // .addInputInterface("Value", "SelectOption", 0)
    .addInputInterface("Value", "SelectOption", 0, {
      items: enumm.values.map((v, i) => ({ text: v, value: i })),
    })
    .addOutputInterface("Output");
  // .addInputInterface("Value", "InputOption");

  enumm.values.forEach((v) => {
    builder.addInputInterface(v, "InputOption");
  });
  builder.onCalculate((n) => {
    const selectedOption = n.getInterface("Value").value;
    n.getInterface("Output").value = n.getInterface(
      enumm.values[selectedOption]
    ).value;
    // n.getInterface("Simple").value = n.getOptionValue("Simple");
    // n.getInterface("Advanced").value = n.getOptionValue("Advanced");
    // n.getInterface("Color").value = n.getOptionValue("Color");
  });

  return { name, node: builder.build() };
};
