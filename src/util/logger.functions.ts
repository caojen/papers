import { Logger } from "@nestjs/common";

const logs: Logger = new Logger('util');
const warns: Logger = new Logger('util');
const errors: Logger = new Logger('util');

function log(c: any) {
  logs.log(c);
}

function warn(c: any) {
  warns.warn(c);
}

function error(c: any) {
  errors.error(c);
}
