import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'
import { BuildWithNixOption } from './type';
import { buildWithNix } from './build-with-nix';

const parser = yargs(hideBin(process.argv)).options({
    expression: { type: 'string', require: true },
    src: { type: 'string', require: false },
    out: { type: 'string', require: false },
    resultFolder: { type: 'string', require: false },
    withInDocker: { type: 'boolean', require: false },
    additionalArg: { type: 'array', require: false },
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
