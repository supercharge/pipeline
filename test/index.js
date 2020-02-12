'use strict'

const Lab = require('@hapi/lab')
const Pipeline = require('../src')
const { expect } = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
let called = false

describe('Pipeline', () => {
  before(() => {
    called = false
  })

  it('runs a basic pipeline', async () => {
    await Pipeline
      .send('hello')
      .through([
        PipelineTask,
        function inlinePipelineFunc (input) {
          return input
        }
      ])
      .then(result => {
        expect(called).to.be.true()
        expect(result).to.equal('hello')
      })
  })
})

class PipelineTask {
  constructor (params) {
    this.params = params
  }

  async handle () {
    called = true

    return this.params
  }
}
