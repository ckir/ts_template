/**
 * This is a sample test suite.
 * Replace this with your implementation.
 */

import { spawn } from 'child_process'
import SuperTest from 'supertest'
import Path, { dirname } from 'path'
import { fileURLToPath } from 'url'
import main from './main.js'

describe('Example Test', function () {
  it('should GET / with 200 OK', function () {
    return SuperTest(main(0))
      .get('/')
      .expect(response => {
        expect(response.status).toEqual(200)
        expect(response.text).toEqual('Olá, Hola, Hello!')
      })
  })

  it('should init without errors', async function () {
    process.env.PORT = '0'

    const dir = dirname(fileURLToPath(import.meta.url))
    const index = Path.resolve(dir, 'main.ts')
    // spawn node with ts-node ESM loader to execute TypeScript in ESM environment
    const proc = spawn(process.execPath, ['--loader', 'ts-node/esm', index], { stdio: 'ignore' })

    expect(proc.pid).toBeDefined()

    process.kill(proc.pid || 0, 'SIGTERM')
  })
})
