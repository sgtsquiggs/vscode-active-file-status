'use strict';

import {Disposable, ExtensionContext, StatusBarItem, StatusBarAlignment, window, workspace} from 'vscode';
import * as path from 'path';

export function activate(context: ExtensionContext) {

    console.log('"Active File Status" is now active!');

    let activeFile = new ActiveFile();
    let controller = new ActiveFileController(activeFile);

    context.subscriptions.push(controller);
    context.subscriptions.push(activeFile);
}

// this method is called when your extension is deactivated
export function deactivate() {
}

class ActiveFile {

    private _statusBarItem: StatusBarItem;

    public updateActiveFile() {

        if (!this._statusBarItem) {
            this._statusBarItem = window.createStatusBarItem(StatusBarAlignment.Left);
            this._statusBarItem.tooltip = 'Copy to Clipboard';
            this._statusBarItem.command = 'workbench.action.files.copyPathOfActiveFile';
        }

        let editor = window.activeTextEditor;
        if (!editor) {
            this._statusBarItem.hide();
            return;
        }

        var filePath = editor.document.fileName;
        if (filePath.indexOf(workspace.rootPath) == 0) {
            filePath = path.relative(workspace.rootPath, filePath);
        }

        this._statusBarItem.text = filePath;
        this._statusBarItem.show();
    }

    dispose() {
        this._statusBarItem.dispose();
    }
}

class ActiveFileController {

    private _activeFile: ActiveFile;
    private _disposable: Disposable;

    constructor(activeFile: ActiveFile) {
        this._activeFile = activeFile;
        this._activeFile.updateActiveFile();

        let subscriptions: Disposable[] = [];
        window.onDidChangeActiveTextEditor(this._onEvent, this, subscriptions);

        this._activeFile.updateActiveFile();

        this._disposable = Disposable.from(...subscriptions);
    }

    dispose() {
        this._disposable.dispose();
    }

    private _onEvent() {
        this._activeFile.updateActiveFile();
    }
}