import { mkdtemp } from 'node:fs/promises';
import * as path from 'node:path';
import { buildWithLocalNix } from "./build-locally";
import { buildWithNixDockerContainer } from "./build-within-docker";
import { startCallbackServer } from "./callback-server";
import { BuildWithNixOption } from "./type";
import { commandExists, commandResult } from "./utils";

const getHostIp = async (useDocker: boolean) => {
    if (process.platform === 'darwin') return 'localhost'
    if (useDocker) {
        if (!await commandExists('docker')) {
            throw new Error('Docker is not running on the Host!')
        }
        return (await commandResult(`docker network inspect bridge -f '{{(index .IPAM.Config 0).Gateway}}'`)).trim()
    }

    return 'localhost'
}

export const buildWithNix = async (options: BuildWithNixOption): Promise<string> => {
    const {
        expressionPath,
        srcPath = path.join(__dirname),
        resultFolder = await mkdtemp('cdk-nix-build-'),
        outPath = "./lib/function.zip",
        withInDocker = true,
        additionalArgs = {},
    } = options;

    const hostIp = await getHostIp(withInDocker)

    const destFilePath = path.join(resultFolder, path.basename(outPath))
    const port = await startCallbackServer(hostIp, destFilePath)

    if (withInDocker) {
        await buildWithNixDockerContainer({
            srcPath,
            expressionPath,
            outPath,
            additionalArgs,
            port
        })
    } else {
        await buildWithLocalNix({
            srcPath,
            expressionPath,
            outPath,
            additionalArgs,
            port
        })
    }

    return destFilePath
}
