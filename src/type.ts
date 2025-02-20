export interface BuildWithNixOption {

    readonly expressionPath: string;

    readonly srcPath?: string; // default to undefined

    readonly outPath?: string; // default to `./lib/function.zip`

    readonly resultFolder?: string; // default to a temp folder

    readonly withInDocker?: boolean; // default to true

    readonly additionalArgs?: Record<string, string>; // default to empty

}

export type BuildOption = Required<Omit<BuildWithNixOption, 'withInDocker' | 'resultFolder' | 'srcPath'>> & {
    readonly port: number,
    readonly srcPath?: string,
}
