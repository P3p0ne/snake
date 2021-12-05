import {readFileSync} from "fs";
import nconf from 'nconf';
import { load as loadYaml, dump as dumpYaml } from 'js-yaml';
import {injectable} from "inversify";

@injectable()
export class Config {
    public readonly config: ConfigData;

    private static readonly YAML_CONFIG_FILE = 'config.yaml';
    private static readonly DEFAULT_YAML_CONFIG_FILE = 'config_defaults.yaml';

    public constructor() {
        nconf
            .env({ separator: '_' })
            .argv()
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            .file({ format: { parse: loadYaml, stringify: dumpYaml }, file: Config.YAML_CONFIG_FILE })
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            .defaults(<ConfigData>loadYaml(readFileSync(Config.DEFAULT_YAML_CONFIG_FILE, 'utf-8')));

        this.config = nconf.get() as ConfigData;
    }
}

interface ConfigData {
    webServer: WebServerConfig;
    mongoDb: MongoDbConfig;
    secret: string;
}

interface MongoDbConfig {
    connectionString: string;
}

interface WebServerConfig {
    port: number;
}
