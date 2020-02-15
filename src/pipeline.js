'use strict'

const Cls = require('@supercharge/classes')

class Pipeline {
  /**
   * Create a new pipeline for the given `pipeable`.
   */
  constructor (pipeable) {
    this.pipes = []
    this.method = 'handle'
    this.pipeable = pipeable
  }

  /**
   * Set the value that will be passed throught the pipeline.
   *
   * @param {*} pipeable
   *
   * @returns {Pipeline}
   */
  static send (pipeable) {
    return new this(pipeable)
  }

  /**
   * Set the array of pipes.
   *
   * @param {Array} pipes
   *
   * @returns {Pipeline}
   */
  through (...pipes) {
    this.pipes = [].concat(...pipes)

    return this
  }

  /**
   * Set the method name to call on the pipes.
   *
   * @param {String} method
   *
   * @returns {Pipeline}
   */
  via (method) {
    this.method = method

    return this
  }

  /**
   * Run the pipeline with a final destination `callback`.
   *
   * @param {Function} callback
   *
   * @returns {*}
   */
  async then (callback) {
    const result = await this.pipes.reduce(
      this.reducer(), this.initial()
    )

    return callback(result)
  }

  /**
   * Run the pipeline and return the result.
   *
   * @returns {*}
   */
  async thenReturn () {
    return this.then((pipeable) => {
      return pipeable
    })
  }

  /**
   * Returns the closure function to reduce the pipeline.
   *
   * @returns {Function}
   */
  reducer () {
    return async (carry, pipe) => {
      const parameters = await carry

      if (Cls.isClass(pipe)) {
        return this.handleClass(pipe, parameters)
      }

      if (Cls.isFunction(pipe)) {
        return pipe(parameters)
      }

      throw new Error(`Pipeline tasks must be classes or functions. Received ${typeof pipe}`)
    }
  }

  /**
   * Instantiate the given `Pipe` class and call the handle method.
   *
   * @param {Class} Pipe
   * @param {*} parameters
   *
   * @returns {*}
   */
  handleClass (Pipe, parameters) {
    const instance = new Pipe(parameters)

    return instance[this.method]()
  }

  /**
   * Returns the initial pipeline value.
   *
   * @returns {*}
   */
  initial () {
    return this.pipeable
  }
}

module.exports = Pipeline
