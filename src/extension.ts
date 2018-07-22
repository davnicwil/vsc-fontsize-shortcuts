"use strict";

import {
  ExtensionContext,
  WorkspaceConfiguration,
  commands,
  window,
  workspace,
} from "vscode";

const minFontSize = 1;
const maxFontSize = Number.MAX_SAFE_INTEGER;

export function activate(context: ExtensionContext) {
  async function increaseFontSize(terminal: boolean) {
    const config = workspace.getConfiguration();
    const fontSizeType = terminal
      ? "terminal.integrated.fontSize"
      : "editor.fontSize";
    const lineHeightProperty = "editor.lineHeight";
    const lineHeight = config.get<number>(lineHeightProperty);
    const fontSize = config.get<number>(fontSizeType);
    const relativeLineHeight = lineHeight / fontSize
    const step = config.get<number>("fontshortcuts.step");
    const newSize = Math.min(maxFontSize, Math.round(fontSize + step));
    const newLineHeight = Math.min(maxFontSize, Math.round(newSize * relativeLineHeight));
    const useGlobalSettings = !config.get<boolean>("fontshortcuts.useWorkspaceSettings", false);
    if (newSize === fontSize) return;
    if (! terminal) config.update(lineHeightProperty, newLineHeight, useGlobalSettings);
    return config.update(fontSizeType, newSize, useGlobalSettings);
  }

  async function decreaseFontSize(terminal: boolean) {
    const config = workspace.getConfiguration();
    const fontSizeType = terminal
      ? "terminal.integrated.fontSize"
      : "editor.fontSize";
    const lineHeightProperty = "editor.lineHeight";
    const lineHeight = config.get<number>(lineHeightProperty);
    const fontSize = config.get<number>(fontSizeType);
    const relativeLineHeight = lineHeight / fontSize
    const step = config.get<number>("fontshortcuts.step");
    const newSize = Math.max(minFontSize, Math.round(fontSize - step));
    const newLineHeight = Math.min(maxFontSize, Math.round(newSize * relativeLineHeight));
    const useGlobalSettings = !config.get<boolean>("fontshortcuts.useWorkspaceSettings", false);
    if (newSize === fontSize) return;
    if (! terminal) config.update(lineHeightProperty, newLineHeight, useGlobalSettings);
    return config.update(fontSizeType, newSize, useGlobalSettings);
  }

  async function resetFontSize(terminal: boolean) {
    const config = workspace.getConfiguration();
    const fontSizeType = terminal
      ? "terminal.integrated.fontSize"
      : "editor.fontSize";
    const defaultFontSizeType = terminal
      ? "fontshortcuts.defaultFontSize"
      : "fontshortcuts.defaultTerminalFontSize";
    const lineHeightProperty = "editor.lineHeight";
    const lineHeight = config.get<number>(lineHeightProperty);
    const defaultFontSize = config.get<number>(defaultFontSizeType);
    const fontSize = config.get<number>(fontSizeType);
    const relativeLineHeight = lineHeight / fontSize
    const defaultLineHeight = Math.min(
      maxFontSize,
      Math.round(defaultFontSize * relativeLineHeight)
    );
    const useGlobalSettings = !config.get<boolean>("fontshortcuts.useWorkspaceSettings", false);
    if (defaultFontSize === null) {
      try {
        if (! terminal) await config.update(lineHeightProperty, undefined, useGlobalSettings);
        return await config.update(fontSizeType, undefined, useGlobalSettings);
      } catch (e) {
        // swallow errors
        return;
      }
    }

    if (
      Number.isSafeInteger(defaultFontSize) &&
      defaultFontSize >= minFontSize &&
      defaultFontSize <= maxFontSize
    ) {
      if (! terminal) config.update(lineHeightProperty, defaultLineHeight, useGlobalSettings);
      return config.update(fontSizeType, defaultFontSize, useGlobalSettings);
    }

    window.showErrorMessage(
      `Cannot set font size to "${defaultFontSize}". Please set "${defaultFontSizeType}" to an integer between ${minFontSize} and ${maxFontSize} in your user settings.`
    );
  }

  context.subscriptions.push(
    commands.registerCommand("fontshortcuts.increaseEditorFontSize", () =>
      increaseFontSize(false)
    ),

    commands.registerCommand("fontshortcuts.increaseTerminalFontSize", () =>
      increaseFontSize(true)
    ),

    commands.registerCommand("fontshortcuts.increaseFontSize", () =>
      Promise.all([increaseFontSize(false), increaseFontSize(true)])
    ),

    commands.registerCommand("fontshortcuts.decreaseEditorFontSize", () =>
      decreaseFontSize(false)
    ),

    commands.registerCommand("fontshortcuts.decreaseTerminalFontSize", () =>
      decreaseFontSize(true)
    ),

    commands.registerCommand("fontshortcuts.decreaseFontSize", () =>
      Promise.all([decreaseFontSize(false), decreaseFontSize(true)])
    ),

    commands.registerCommand("fontshortcuts.resetEditorFontSize", () =>
      resetFontSize(false)
    ),

    commands.registerCommand("fontshortcuts.resetTerminalFontSize", () =>
      resetFontSize(true)
    ),

    commands.registerCommand("fontshortcuts.resetFontSize", () =>
      Promise.all([resetFontSize(false), resetFontSize(true)])
    )
  );
}

export function deactivate() {}
