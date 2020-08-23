'use strict'

const Pipeline = require('..')

let called = false

describe('Pipeline', () => {
  beforeEach(() => {
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
        expect(called).toBe(true)
        expect(result).toEqual('Marcus-Class-Function')
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

    expect(called).toBe(true)
    expect(result).toEqual('hello-Class-finished')
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

    expect(called).toBe(true)
    expect(result).toEqual('this is the final result')
  })

  it('via', async () => {
    await Pipeline
      .send('hello')
      .via('customMethodName')
      .through(
        CustomMethodPipelineTask
      )
      .then(result => {
        expect(called).toBe(true)
        expect(result).toEqual('hello')
      })
  })

  it('throws when neither class nor function', async () => {
    try {
      await Pipeline
      .send('hello')
      .via('customMethodName')
      .through(123)
      .then(() => { })
    } catch (error) {
      expect(error.message).toContain('tasks must be classes or functions')
    }
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
