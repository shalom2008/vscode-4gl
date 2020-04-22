"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");

/**
 * Keep track of where each tab starts.
 */
class TabMeta {
    constructor(range) {
        this.range = range;
    }
}
/**
 * Links tabs to their functions and their starting lines.
 */
class SymbolStore {
    constructor() {
        this.currentTab = 0;
        this.tabFns = new Map();
        this.tabMetas = new Map();
        // Special case: There is always a tab 0. Range is the start of the Lua section.
        this.tabMetas.set(0, new TabMeta(new vscode.Range(new vscode.Position(2, 0), new vscode.Position(2, 0))));
    }
    /**
     * Call this to add a function when one is found.
     */
    add(fn) {
        let fns = this.tabFns.get(this.currentTab);
        if (!fns) {
            fns = new Array();
            this.tabFns.set(this.currentTab, fns);
        }
        fns.push(fn);
    }
    /**
     * Call this when a tab break is found.
     */
    advanceTab(range) {
        this.currentTab += 1;
        const tabMeta = new TabMeta(range);
        this.tabMetas.set(this.currentTab, tabMeta);
    }
    /**
     * Generates the final symbol hierarchy in VS Code terms.
     *
     * Runs either a flat listing of functions if not tabs,
     * or tabs with functions below each.
     */
    asSymbolArray() {
        if (this.currentTab == 0) {
            return this.tabFns.get(0) || new Array();
        }
        else {
            const tabSymbols = new Array();
            for (let i = 0; i <= this.currentTab; i++) {
                const fns = this.tabFns.get(i);
                const tabMeta = this.tabMetas.get(i);
                if (tabMeta) {
                    const tabSymbol = new vscode.DocumentSymbol('' + i, '', vscode.SymbolKind.Field, tabMeta.range, tabMeta.range);
                    if (fns) {
                        tabSymbol.children = fns;
                    }
                    tabSymbols.push(tabSymbol);
                }
            }
            return tabSymbols;
        }
    }
}
/**
 * Loop through the lines of the file. When tabs or functions are
 * found, save them in the store. At the end, report the store's
 * final state back to VS Code.
 */
class IFX4GLDocumentSymbolProvider {
    provideDocumentSymbols(document, token) {
        const store = new SymbolStore();
        for (let i = 0; i < document.lineCount; i++) {
            const line = document.lineAt(i);
            if (line.text.match(/^-->8/)) {
                store.advanceTab(line.range);
            }
            else if (line.text.match(/^ *function /i)) {
                const functionName = line.text.replace(/^ *function /i, '').replace(/\(.*/, '').trim();
                // Must validate that it is not blank, otherwise it will report others incorrectly.
                if (functionName.length > 0) {
                    store.add(new vscode.DocumentSymbol(functionName, '', vscode.SymbolKind.Function, line.range, line.range));
                }
            }
            else if (line.text.match(/^ *MAIN($|\s+)/)) {
                store.add(new vscode.DocumentSymbol('MAIN', '', vscode.SymbolKind.Key, line.range, line.range));
            }
            else if (line.text.match(/^ *(GLOBALS ).+/)) {
                store.add(new vscode.DocumentSymbol('GLOBALS ' + i, '', vscode.SymbolKind.Key, line.range, line.range));
            }
        }
        return store.asSymbolArray();
    }
}
//# sourceMappingURL=extension.js.map

module.exports = {
    IFX4GLDocumentSymbolProvider:IFX4GLDocumentSymbolProvider,
}