# engineering-symbols-tool-figma

A Figma plugin for creating Engineering Symbols.

> NOTE: This plugin has not yet been published on the [Figma Community](https://www.figma.com/community/plugins) platform.

## Development Setup

### Build plugin

```sh
# Build development version
npm run build
```

### Add plugin to Figma

From the main menu, navigate to the plugin manager:

> Plugins > Development > Manage plugins in development

In the plugin manager window, choose `Development` from the dropdown.

Add plugin:

> '+' button > Import plugin from manifest...

Select the repository folder containing the `manifest.json` file.

### Hot reloading

```sh
# Run watch mode for both UI and Figma code
npm run dev
```

## Manual Distribution

1. Build release: `npm run build:release`
2. Copy `dist` folder and `manifest.json` to folder on disk ex.: `my-custom-plugin-v1`
3. This folder can now be shared and loaded manually by other users as a development plugin

## Credits

This plugin uses a modified version of the great [Fill Rule Editor](https://github.com/evanw/figma-fill-rule-editor) by [Evan Wallace](https://github.com/evanw). The modification allows zooming on the canvas.
