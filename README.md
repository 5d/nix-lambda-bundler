# nix-lambda-bundler 🏗️🚀


**nix-lambda-bundler** is a tool that leverages Nix to customize the bundling process for AWS Lambda functions. It allows you to define and manage your dependencies using Nix, ensuring reproducibility and flexibility in your build process.

You can use either:

- **System-installed Nix** (if you already have Nix installed on your machine).
- **Nix within Docker** (using the official Nix Docker image for isolated builds).

## Installation

First, configure your project to set my GitHub registry namespace by adding or modifying the `.npmrc` file in the project root. Append the following line:

```
@5d:registry=https://npm.pkg.github.com
```

Then, install the package as a development dependency in your CDK project:

```
npm i -D @5d/nix-lambda-bundler
```

## Getting started

This package is designed as a command-line tool named `nix-lambda-bundler`. The main reason for this approach is that the build process is implemented using asynchronous functions, as it naturally fits the workflow. However, since AWS CDK does not run in an asynchronous context, exporting the `buildWithNix` async function would be impractical and difficult to execute within synchronous functions using the `child_process` module.

You can wrap your nix lambda bundling code like this:
```ts
const buildWithNix = (): AssetCode => {
  const tempFolder = childProcess.execSync('mktemp -d').toString().trim()
  const cmd = `
    npx nix-lambda-bundler \
    --withInDocker false \
    --resultFolder ${tempFolder} \
    --src ${path.join(__dirname, 'lambda')} \
    --expression ${path.join(__dirname, 'nix')} \
    --additionalArg 'entryPoints,handler.ts'
  `

  childProcess.execSync(cmd)
  return new AssetCode(path.join(tempFolder, 'function.zip'))
}

new Function(this, 'LambdaFunctionWithNix', {
      runtime: Runtime.NODEJS_22_X,
      architecture: Architecture.ARM_64,
      code: buildWithNix(),
      handler: 'handler.handler'
    })
}
```

The cli offers several options as below:

```sh
$ npx nix-lambda-bundler --help

Options:
  --help           Show help                                           [boolean]
  --version        Show version number                                 [boolean]
  --expression     Path to the Nix expression file/folder    [string] [required]
  --src            Path to the Lambda source code folder  [string] [default: ./]
  --out            Relative path of the final output inside the Nix $out
                   directory              [string] [default: ./lib/function.zip]
  --resultFolder   Directory where the generated result (function.zip) will be
                   stored       [string] [default: temporary folder (mktemp -d)]
  --withInDocker   Run the build inside the official Nix Docker container
                                                       [boolean] [default: true]
  --additionalArg  Extra arguments to pass to the Nix expression using --argstr.
                   Format: "key,value"                  [array] [default: empty]
```
