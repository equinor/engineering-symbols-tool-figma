import { PluginAction } from "../../plugin/types";

export function postMessageToPlugin(
  pluginMessage: PluginAction,
  targetOrigin = "*"
) {
  parent.postMessage(
    {
      pluginMessage: pluginMessage,
    },
    targetOrigin
  );
}
