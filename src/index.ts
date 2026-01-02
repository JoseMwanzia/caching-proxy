#!/usr/bin/env ts-node

import { program } from "commander";
import Server from "./utils/server";
import * as dotenv from 'dotenv'
dotenv.config()

const { REDIS_URL } = process.env

program.version('1.0.0').description('A proxy server')

program
    .option('-p, --port <port>', 'port to run the server')
    .option('-o --origin <origin>', 'url origin to send tracffic')
    .action((options) => {
        const port = parseInt(options.port)

        // Validate the port number
        if (isNaN(port) || port < 1 || port > 65535) {
            console.error('Invalid Port Number')
            return;
        }

        // Validate the Origin URL
        try {
            new URL(options.origin)
        } catch (error) {
            console.error("❌ Invalid URL " + error)
            return;
        }

        const user = new Server(options.port, options.origin)
        user.startServer()
    });

program
    .command('clear-cache')
    .action( async () => {
        await Server.clearCache(REDIS_URL!)
        console.log('Deleted cache')
        process.exit(0)
    })

program.parse(process.argv)

 