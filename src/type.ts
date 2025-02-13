export interface BuildWithNixOption {

    readonly expressionPath: string;

    readonly srcPath?: string;

    readonly outPath?: string; // default to `./lib/function.zip`

    readonly resultFolder?: string; // default to a temp folder

    readonly withInDocker?: boolean; // default to true

    readonly additionalArgs?: Record<string, string>; // default to empty

}

export type BuildOption = Required<Omit<BuildWithNixOption, 'withInDocker' | 'resultFolder'>> & {
    readonly port: number
}
