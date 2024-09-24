import pkg from './package.json' with { type: 'json' }
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec);
const dependencies = Object.keys(pkg.dependencies);

async function updateDependencies() {
    for (const dep of dependencies) {
        try {
            const { stdout: uninstallStdout, stderr: uninstallStderr } = await execAsync(`npm uninstall ${dep}`);
            console.log(uninstallStdout);
            console.error(uninstallStderr);
        } catch (error) {
            console.error(`Error uninstalling ${dep}:`, error);
        }
    }

    for (const dep of dependencies) {
        try {
            const { stdout: installStdout, stderr: installStderr } = await execAsync(`npm install ${dep}`);
            console.log(installStdout);
            console.error(installStderr);
        } catch (error) {
            console.error(`Error installing ${dep}:`, error);
        }
    }
}

updateDependencies();