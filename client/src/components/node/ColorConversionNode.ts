import { Node } from "@baklavajs/core";
import { INodeState } from "@baklavajs/core/dist/baklavajs-core/types";
import convertColor from "color-convert";
import { HSV, RGB } from "color-convert/conversions";

const colorModels = ["hex", "rgb", "hsv"] as const;
type IColorModel = (typeof colorModels)[number];

// const colorModelToValues: Record<IColorModel, [string, string, string]> = {
//   rgb: ["R", "G", "B"],
//   hsv: ["H", "S", "V"],
// };

export class ColorConversionNode extends Node {
  type = "ColorConversionNode";
  name = "Color Conversion";

  currentColorModelInput: IColorModel = "rgb";
  currentColorModelOutput: IColorModel = "hsv";

  constructor() {
    super();
    const colorModelInputOption = this.addOption(
      "ColorModelInput",
      "SelectOption",
      "rgb",
      undefined,
      {
        items: colorModels.map((value) => ({
          text: value,
          value,
        })),
      }
    );
    const colorModelOutputOption = this.addOption(
      "ColorModelOutput",
      "SelectOption",
      "hsv",
      undefined,
      {
        items: colorModels.map((value) => ({
          text: value,
          value,
        })),
      }
    );
    colorModelInputOption?.events.setValue.addListener(this, () => {
      this.updateInputInterfaces();
    });
    colorModelOutputOption?.events.setValue.addListener(this, () => {
      this.updateOutputInterfaces();
    });
    this.addInterfaces("input", true);
    this.addInterfaces("output", true);
  }

  public load(state: INodeState) {
    // TODO: Probably have to implement
  }

  public calculate() {
    const colorModelInput: IColorModel = this.getOptionValue("ColorModelInput");
    const colorModelOutput: IColorModel =
      this.getOptionValue("ColorModelOutput");

    if (colorModelInput === colorModelOutput) {
      return;
    }

    let outputColor: RGB | HSV | string;
    if (colorModelInput === "rgb" && colorModelOutput !== "rgb") {
      outputColor = convertColor.rgb[colorModelOutput]([
        this.getInterface("R In").value,
        this.getInterface("G In").value,
        this.getInterface("B In").value,
      ]);
    } else if (colorModelInput === "hsv" && colorModelOutput !== "hsv") {
      outputColor = convertColor.hsv[colorModelOutput]([
        this.getInterface("H In").value,
        this.getInterface("S In").value,
        this.getInterface("V In").value,
      ]);
    } else if (colorModelInput === "hex" && colorModelOutput !== "hex") {
      outputColor = convertColor.hex[colorModelOutput](
        this.getInterface("Value In").value
      );
    } else {
      throw new Error("Not valid color mode");
    }

    switch (colorModelOutput) {
      case "hex": {
        this.getInterface("Value Out").value = outputColor;
        break;
      }
      case "hsv": {
        this.getInterface("H Out").value = outputColor[0];
        this.getInterface("S Out").value = outputColor[1];
        this.getInterface("V Out").value = outputColor[2];
        break;
      }
      case "rgb": {
        this.getInterface("R Out").value = outputColor[0];
        this.getInterface("G Out").value = outputColor[1];
        this.getInterface("B Out").value = outputColor[2];
      }
    }
  }

  private updateInputInterfaces() {
    this.removeInterfaces("input");
    this.addInterfaces("input");
  }

  private updateOutputInterfaces() {
    this.removeInterfaces("output");
    this.addInterfaces("output");
  }

  private addInterfaces(direction: "input" | "output", initial = false) {
    let colorModel: IColorModel;
    if (initial) {
      if (direction === "input") {
        colorModel = "rgb";
      } else {
        colorModel = "hsv";
      }
    } else {
      colorModel = this.getOptionValue(
        `ColorModel${direction === "input" ? "Input" : "Output"}`
      );
    }

    if (direction === "input") {
      this.currentColorModelInput = colorModel;
    } else {
      this.currentColorModelOutput = colorModel;
    }
    const dir = direction === "input" ? "In" : "Out";
    if (direction === "input") {
      if (colorModel === "rgb") {
        this.addInputInterface(`R ${dir}`);
        this.addInputInterface(`G ${dir}`);
        this.addInputInterface(`B ${dir}`);
      } else if (colorModel === "hsv") {
        this.addInputInterface(`H ${dir}`);
        this.addInputInterface(`S ${dir}`);
        this.addInputInterface(`V ${dir}`);
      } else if (colorModel === "hex") {
        this.addInputInterface(`Value ${dir}`);
      }
    } else {
      if (colorModel === "rgb") {
        this.addOutputInterface(`R ${dir}`);
        this.addOutputInterface(`G ${dir}`);
        this.addOutputInterface(`B ${dir}`);
      } else if (colorModel === "hsv") {
        this.addOutputInterface(`H ${dir}`);
        this.addOutputInterface(`S ${dir}`);
        this.addOutputInterface(`V ${dir}`);
      } else if (colorModel === "hex") {
        this.addOutputInterface(`Value ${dir}`);
      }
    }
  }

  private removeInterfaces(direction: "input" | "output") {
    const dir = direction === "input" ? "In" : "Out";
    const type =
      direction === "input"
        ? this.currentColorModelInput
        : this.currentColorModelOutput;
    if (type === "rgb") {
      this.removeInterface(`R ${dir}`);
      this.removeInterface(`G ${dir}`);
      this.removeInterface(`B ${dir}`);
    } else if (type === "hsv") {
      this.removeInterface(`H ${dir}`);
      this.removeInterface(`S ${dir}`);
      this.removeInterface(`V ${dir}`);
    } else if (type === "hex") {
      this.removeInterface(`Value ${dir}`);
    }
  }
}
