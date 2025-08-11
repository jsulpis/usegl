import { useEffectPass } from "../../hooks/useEffectPass";
import linearToSRGBFrag from "./linearToSRGB.frag";

export function linearToSRGB() {
  return useEffectPass({
    fragment: linearToSRGBFrag,
  });
}
