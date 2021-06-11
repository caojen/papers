import log from './logger.functions'

export async function cron_main() {
    log.log(['cron started...']);
}

export async function cron_exit() {
    log.log(['cron exited...']);
}
