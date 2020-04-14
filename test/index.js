'use strict'

const Lab = require('@hapi/lab')
const Pipeline = require('..')
const { expect } = require('@hapi/code')

const { describe, it, before } = (exports.lab = Lab.script())
let called = false

describe('Pipeline', () => {
  before(() => {
    called = false
  })

  it('runs a basic array pipeline', async () => {
    await Pipeline
      .send('Marcus')
      .through([
        PipelineTask,
        function inlinePipelineFunc (input) {
          return `${input}-Function`
        }
      ])
      .then(result => {
        expect(called).to.be.true()
        expect(result).to.equal('Marcus-Class-Function')
      })
  })

  it('runs a basic items pipeline', async () => {
    const result = await Pipeline
      .send('hello')
      .through(
        PipelineTask,
        function inlinePipelineFunc (input) {
          return input
        }
      )
      .then(result => {
        return `${result}-finished`
      })

    expect(called).to.be.true()
    expect(result).to.equal('hello-Class-finished')
  })

  it('thenReturn', async () => {
    const result = await Pipeline
      .send('hello')
      .through(
        PipelineTask,
        function inlinePipelineFunc () {
          return 'this is the final result'
        }
      )
      .thenReturn()

    expect(called).to.be.true()
    expect(result).to.equal('this is the final result')
  })

  it('via', async () => {
    await Pipeline
      .send('hello')
      .via('customMethodName')
      .through(
        CustomMethodPipelineTask
      )
      .then(result => {
        expect(called).to.be.true()
        expect(result).to.equal('hello')
      })
  })

  it('throws when neither class nor function', async () => {
    await expect(Pipeline
      .send('hello')
      .via('customMethodName')
      .through(123)
      .then(() => { })
    ).to.reject()
  })
})

class PipelineTask {
  constructor (name) {
    this.name = name
  }

  async handle () {
    called = true

    return `${this.name}-Class`
  }
}

class CustomMethodPipelineTask {
  constructor (params) {
    this.params = params
  }

  async customMethodName () {
    called = true

    return this.params
  }
}
