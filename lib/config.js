import {safeLoad} from 'js-yaml';
import {readFileSync} from 'fs';
import * as path from 'path';

const config = safeLoad(readFileSync(path.join(__dirname, '../config.yml'), 'utf8'));

export default config;
