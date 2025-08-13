import { useEffectPass } from "../../hooks/useEffectPass";
import { linearToSRGBFragment } from "./linearToSRGB.frag";

export function linearToSRGB() {
  return useEffectPass({
    fragment: linearToSRGBFragment,
  });
}
