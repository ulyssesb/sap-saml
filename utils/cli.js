#!/usr/bin/env node --es-module-specifier-resolution=node

/* eslint-disable import/extensions */
import got from 'got'
import yargs from 'yargs'
import auth, { log } from '../src/auth'

/**
 * YArguments
 */
const { argv } = yargs.options({
    s: {
        alias: 'url',
        demandOption: true,
        describe: 'SAP URL to authenticate to',
        type: 'string'
    },
    u: {
        alias: 'user',
        demandOption: true,
        describe: 'Username',
        type: 'string'
    },
    p: {
        alias: 'pass',
        demandOption: true,
        describe: 'Password',
        type: 'string'
    },
    d: {
        alias: 'dbg',
        demandOption: false,
        describe: 'Set debug mode on',
        type: 'boolean'
    }
})

/**
 * Do the thing
 */
async function run() {
    try {
        // Authenticate and get cookie jar to be re-use in future calls
        const cookies = await auth(argv.url, argv.user, argv.pass)

        if (argv.dbg) console.log(log.stringify())

        // Inject cookies and call GET on endpoint to test authentication
        const resp = await got.get(argv.url, {
            cookieJar: cookies
        })
        console.log(resp.body)
    } catch (e) {
        console.error(`${e.message}`)
    }
}

run()
