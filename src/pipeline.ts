'use strict'

import { isClass, isFunction } from '@supercharge/classes'

export class Pipeline {
  /**
   * The array of class or function pipes.
   */
  private pipes: any[] = []

  /**
   * The object that will be sent through the pipeline.
   */
  private readonly pipeable: any

  /**
   * The method called on each pipe.
   */
  private method: string = 'handle'

  /**
   * Create a new pipeline instance for the given `pipeable`.
   */
  constructor (pipeable: any) {
    this.pipeable = pipeable
  }

  /**
   * Set the value that will be passed throught the pipeline.
   *
   * @param {*} pipeable
   *
   * @returns {Pipeline}
   */
  static send (pipeable: any): Pipeline {
    return new this(pipeable)
  }

  /**
   * Set the array of pipes.
   *
   * @param {Array} pipes
   *
   * @returns {Pipeline}
   */
  through (...pipes: any[]): this {
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
  via (method: string): this {
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
  async then (callback: Function): Promise<any> {
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
  async thenReturn (): Promise<any> {
    return await this.then((pipeable: any) => {
      return pipeable
    })
  }

  /**
   * Returns the closure function to reduce the pipeline.
   *
   * @returns {Function}
   */
  reducer () {
    return async (carry: any, pipe: any) => {
      const parameters = await carry

      if (isClass(pipe)) {
        return this.handleClass(pipe, parameters)
      }

      if (isFunction(pipe)) {
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
  handleClass (Pipe: any, parameters: any): any {
    const instance = new Pipe(parameters)

    return instance[this.method]()
  }

  /**
   * Returns the initial pipeline value.
   *
   * @returns {*}
   */
  initial (): any {
    return this.pipeable
  }
}
