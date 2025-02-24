declare global {
    namespace NodeJS {
        interface ProcessEnv {
            ENV_VAR_1: string
            ENV_VAR_2: string
        }
    }
}

export { }