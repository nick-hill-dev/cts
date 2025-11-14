# Debugging

Simple `F5` debugging permits debugging, so long as your VS Code window is scoped to the `concise-table-schema-language` folder.

# Compiling

To compile the custom action, `npm run compile` will do.

# Packaging

You need `vsce`: `npm install -g vsce`.

Then: `vsce package`

This will create a `.vsix` package in this directory. You can then use the `Install from VSIX` tool in VS code to install the extension.

# Publishing to Visual Studio Marketplace

With an account in Visual Studio Code Marketplace you can upload the `vsix` file directly.

Alternatively, run `vsce publish`.