import { BuildOption } from "./type";
import { executeCmd } from "./utils";

export const buildWithNixDockerContainer = async (options: BuildOption) => {
    const { srcPath, outPath, expressionPath, port, additionalArgs } = options
    const argStrs = Object.entries({
        ...additionalArgs,
        cdkSrc: srcPath
    }).map(([k, v]) => `--argstr ${k} ${v}`).join(' ')

    const cmd = `
        docker run --rm \
            --add-host=host.docker.internal:host-gateway \
            -v ${srcPath}:/cdk-src \
            -v ${expressionPath}:/cdk-nix \
            nixos/nix \
            bash -c "\
                tempFolder=$(mktemp -d) \
                && nix-build --out-link $tempFolder/result /cdk-nix ${argStrs} \
                && nix-shell -p curl --run 'curl -sS -X POST http://host.docker.internal:${port}/ \
                    -F \\"file=@$tempFolder/result/${outPath};type=application/zip\\"' \
                "`;

    await executeCmd(cmd)
}
