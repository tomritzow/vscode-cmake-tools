import { fs } from '@cmt/pr';
import {
    clearExistingKitConfigurationFile,
    DefaultEnvironment,
    expect
} from "@test/util";
import * as path from 'path';
import * as vscode from 'vscode';

suite('Preset v5 functionality', () => {
    let testEnv: DefaultEnvironment;
    let compdb_cp_path: string;

    suiteSetup(async function (this: Mocha.Context) {
        this.timeout(100000);

        const build_loc = 'build';
        const exe_res = 'output.txt';

        // CMakePresets.json and CMakeUserPresets.json exist so will use presets by default
        testEnv = new DefaultEnvironment('test/extension-tests/single-root-UI/preset-v5-tests/project-folder', build_loc, exe_res);
        compdb_cp_path = path.join(testEnv.projectFolder.location, 'compdb_cp.json');

        await vscode.workspace.getConfiguration('cmake', vscode.workspace.workspaceFolders![0].uri).update('useCMakePresets', 'always');
        await vscode.commands.executeCommand('cmake.getSettingsChangePromise');

        await clearExistingKitConfigurationFile();
    });

    setup(async function (this: Mocha.Context) {
        this.timeout(100000);

        testEnv.projectFolder.buildDirectory.clear();
    });

    teardown(async function (this: Mocha.Context) {
    });

    suiteTeardown(async () => {
        await vscode.workspace.getConfiguration('cmake', vscode.workspace.workspaceFolders![0].uri).update('useCMakePresets', 'auto');
        await vscode.commands.executeCommand('cmake.getSettingsChangePromise');

        if (testEnv) {
            testEnv.teardown();
        }
        if (await fs.exists(compdb_cp_path)) {
            await fs.unlink(compdb_cp_path);
        }
        if (await fs.exists(testEnv.projectFolder.buildDirectory.location)) {
            testEnv.projectFolder.buildDirectory.clear();
        }
    });

    test('Attempt to configure and build Linux1 preset with path list separator macro', async function (this: Mocha.Context) {
        await vscode.commands.executeCommand('cmake.setConfigurePreset', 'Linux1');
        await vscode.commands.executeCommand('cmake.setBuildPreset', 'Linux1');
        await vscode.commands.executeCommand('cmake.setTestPreset', 'Linux1');
        expect(await vscode.commands.executeCommand('cmake.configure')).to.eq(0, 'configure with path list separator macro failed');
        await vscode.commands.executeCommand('cmake.build');

        const result = await testEnv.result.getResultAsJson();
        expect(result['cookie']).to.eq('passed-cookie');
    }).timeout(100000);

    test('Attempt to configure and build Linux2 preset with test output truncation enabled', async function (this: Mocha.Context) {
        await vscode.commands.executeCommand('cmake.setConfigurePreset', 'Linux2');
        await vscode.commands.executeCommand('cmake.setBuildPreset', 'Linux2');
        await vscode.commands.executeCommand('cmake.setTestPreset', 'Linux2');
        expect(await vscode.commands.executeCommand('cmake.configure')).to.eq(0, 'configure with test output truncation failed');
        await vscode.commands.executeCommand('cmake.build');

        const result = await testEnv.result.getResultAsJson();
        expect(result['cookie']).to.eq('passed-cookie');
    }).timeout(100000);
});
