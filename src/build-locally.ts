import { BuildOption } from "./type";
import { commandExists, commandResult, newTempdir } from "./utils";

export const buildWithLocalNix = async (options: Required<BuildOption>) => {
    if (!await commandExists('nix-build')) {
        throw new Error('Nix is not installed locally')
    }

    const { srcPath, outPath, expressionPath, port, additionalArgs } = options

    const argStrs = Object.entries({
        ...additionalArgs,
        cdkSrc: srcPath
    }).map(([k, v]) => `--argstr ${k} ${v}`).join(' ')

    const tempFolder = await newTempdir()
    const cmd = `
        bash -c "\
            nix-build --out-link ${tempFolder}/result ${expressionPath} ${argStrs} \
            && nix-shell -p curl --run 'curl -sS -X POST http://localhost:${port}/ \
                -F \\"file=@${tempFolder}/result/${outPath};type=application/zip\\"' \
        "
    `

    await commandResult(cmd)
}
