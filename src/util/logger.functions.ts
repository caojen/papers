import { Logger } from '@nestjs/common';

const logs: Logger = new Logger('util');
const warns: Logger = new Logger('util');
const errors: Logger = new Logger('util');

function log(c: any[]) {
  let output = '';
  for (const cc of c) {
    output += `${cc} `;
  }

  logs.log(output);
}

function warn(c: any[]) {
  let output = '';
  for (const cc of c) {
    output += `${cc} `;
  }

  warns.warn(output);
}

function error(c: any[]) {
  let output = '';
  for (const cc of c) {
    output += `${cc} `;
  }

  errors.error(output);
}

export default {
  log,
  warn,
  error,
};
