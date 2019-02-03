const vscode = require('vscode');
const fs = require("fs");
const path = require('path');

function resolveHome(filepath) {
    if (filepath[0] === '~') {
        return path.join(process.env.HOME, filepath.slice(1));
	}

    return filepath;
}

function sync(file) {
	try {
		const json = JSON.parse(fs.readFileSync(file));

		for (const [key, value] of Object.entries(json)) {
			const extensionSettings = vscode.workspace.getConfiguration(key, vscode.ConfigurationTarget.Global)

			for (const [subkey, subvalue] of Object.entries(value)) {
				extensionSettings.update(subkey, subvalue, vscode.ConfigurationTarget.Global)
			}
		}
	} catch(e) {
		vscode.window.showErrorMessage('Unable to sync file ' + file);
		console.error('Unable to sync file', e);
	}
}

function run() {
	try {
		const extensionSettings = vscode.workspace.getConfiguration('settings-extender', vscode.ConfigurationTarget.Global)
		if (extensionSettings.has('files')) {
			const files = extensionSettings.get('files');

			for (const file of files) {
				sync(resolveHome(file));
			}
		}
	} catch(e) {
		console.error(e);
	}
}

function activate(context) {
	console.log('settings-extender active');

	let disposable = vscode.commands.registerCommand('extension.settingsExtenderRefresh', function () {
		run();
	});

	context.subscriptions.push(disposable);
}
exports.activate = activate;

function deactivate() {}

module.exports = {
	activate,
	deactivate
}
