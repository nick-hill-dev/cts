# Concise Table Schema Language

CTS is a language for describing database schema as concisely as possible.

This extension enables syntax highlighting for `.cts` files as well as a few code snippets, such as `ctst` for defining a table.

## Release Notes

### 1.0.0

Initial release of CTS.

# Debugging

Simple `F5` debugging permits debugging.

# Compiling

You need `vsce`: `npm install -g vsce`.

Then:

```bash
vsce package
```

This will create a `.vsix` package in this directory. You can then use the `Install from VSIX` tool in VS code to install the extension.

# Publishing

With an account in Visual Studio Code Marketplace you can upload the `vsix` file directly.

Alternatively, run `vsce publish`.