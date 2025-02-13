import { exec } from "node:child_process";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { promisify } from "node:util";
import * as path from "path";

const execPromise = promisify(exec)

export const commandExists = async (command: string): Promise<boolean> => {
    const { stderr } = await execPromise(`which ${command}`)
    return stderr == null || stderr.length === 0
}

export const commandResult = async (command: string): Promise<string> => {
    return execPromise(command).then(({ stdout, stderr }) => {
        if (stderr != null && stderr.trim().length > 0) {
            return Promise.reject(stderr)
        }
        return Promise.resolve(stdout)
    })
}

export const newTempdir = async (prefix: string = ''): Promise<string> => {
    return await mkdtemp(path.join(tmpdir(), prefix))
}
