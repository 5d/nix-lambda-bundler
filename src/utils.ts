import { exec } from "node:child_process";
import { promisify } from "node:util";

const execPromise = promisify(exec)

export const commandExists = async (command: string): Promise<boolean> => {
    const { stderr } = await execPromise(`which ${command}`)
    return stderr == null
}

export const commandResult = async (command: string): Promise<string> => {
    return execPromise(command).then(({ stdout, stderr }) => {
        if (stderr != null && stderr.trim().length > 0) {
            return Promise.reject(stderr)
        }
        return Promise.resolve(stdout)
    })
}
