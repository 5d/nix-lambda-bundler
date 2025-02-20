import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'
import { BuildWithNixOption } from './type';
import { buildWithNix } from './build-with-nix';

const parser = yargs(hideBin(process.argv)).options({
    expression: {
        type: 'string',
        demandOption: true,
        description: "Path to the Nix expression file/folder",
    },
    src: {
        type: 'string',
        demandOption: false,
        description: "Path to the Lambda source code folder",
        defaultDescription: "empty; The source can be defined elsewhere and retrieved remotely."
    },
    out: {
        type: 'string',
        demandOption: false,
        description: "Relative path of the final output inside the Nix $out directory",
        defaultDescription: "./lib/function.zip"
    },
    resultFolder: {
        type: 'string',
        demandOption: false,
        description: "Directory where the generated result (function.zip) will be stored",
        defaultDescription: "temporary folder (mktemp -d)"
    },
    withInDocker: {
        type: 'boolean',
        demandOption: false,
        description: 'Run the build inside the official Nix Docker container',
        defaultDescription: 'true'
    },
    additionalArg: {
        type: 'array',
        demandOption: false,
        description: 'Extra arguments to pass to the Nix expression using --argstr. Format: "key,value"',
        defaultDescription: 'empty'
    },
});

const parseAdditionalArg = (arg: string): [string, string] => {
    const [key, value] = arg.split(',')
    return [key, value]
}

(async () => {
    const argv = await parser.parse()
    const options: BuildWithNixOption = {
        srcPath: argv.src,
        expressionPath: argv.expression,
        outPath: argv.out,
        resultFolder: argv.resultFolder,
        withInDocker: argv.withInDocker,
        additionalArgs: Object.fromEntries((argv.additionalArg ?? []).filter(x => typeof x === 'string').map(parseAdditionalArg))
    }
    await buildWithNix(options)
})()
