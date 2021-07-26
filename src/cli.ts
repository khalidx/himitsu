#!/usr/bin/env node

import { writeFileSync } from 'fs'
import { prompt } from 'inquirer'

import { search } from './index'

/**
 * Handles launching a dev watch script with hot-reload,
 * or the main command line application.
 */
export function cli () {
  const args = process.argv.slice(2)
  const dev = args.indexOf('--dev')
  if (dev > -1) {
    args.splice(dev, 1)
    import('nodemon').then(({ default: nodemon }) => {
      nodemon({ script: __filename, args, ext: 'ts' }).on('restart', (files) => console.log('App restarted due to:', files))
    })
  } else {
    prompt([
      {
        message: 'What is the value you are searching for?',
        name: 'value',
        type: 'password',
        mask: '*'
      }
    ])
    .then(answers => search(answers.value))
    .then(result => {
      if (args.includes('--out')) {
        writeFileSync('./himitsu.json', JSON.stringify(result, null, 2))
      } else {
        console.log(result)
      }
    })
    .catch(error => {
      console.error(error)
      process.exit(1)
    })
  }
}

/* Can be imported as a module, or started as a CLI */
if (require.main === module) {
  cli()
}
