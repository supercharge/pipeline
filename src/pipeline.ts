'use strict'

import { isClass, isFunction } from '@supercharge/classes'

type Pipe<T> = PipeableClass<T> | PipeableFunction<T>

interface PipeableClass<T> {
  new (pipeable: T): this
  handle: <R>() => R | Promise<R>
}

type PipeableFunction<T> = <R>(pipeable: T) => R | Promise<R>

export class Pipeline<T> {
  /**
   * The array of class or function pipes.
   */
  private pipes: Array<Pipe<T>> = []

  /**
   * The object that will be sent through the pipeline.
   */
  private readonly pipeable: T

  /**
   * The method called on each pipe.
   */
  private method: string = 'handle'

  /**
   * Create a new pipeline instance for the given `pipeable`.
   */
  constructor (pipeable: T) {
    this.pipeable = pipeable
  }

  /**
   * Set the value that will be passed throught the pipeline.
   *
   * @param {*} pipeable
   *
   * @returns {Pipeline}
   */
  static send<T> (pipeable: T): Pipeline<T> {
    return new this(pipeable)
  }

  /**
   * Set the array of pipes.
   *
   * @param {Array} pipes
   *
   * @returns {Pipeline}
   */
  through (...pipes: Array<Pipe<T>> | Array<Array<Pipe<T>>>): this {
    this.pipes = ([] as Array<Pipe<T>>).concat(...pipes)

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
   * Run the pipeline and return the result.
   *
   * @returns {*}
   */
  async thenReturn<R> (): Promise<R> {
    return await this.then((result: R) => {
      return result
    })
  }

  /**
   * Run the pipeline with a final destination `callback`.
   *
   * @param {Function} callback
   *
   * @returns {*}
   */
  async then<R> (callback: Function): Promise<R> {
    let intermediate: any = this.initial()

    for (const pipe of this.pipes) {
      intermediate = await this.handle<R>(pipe, intermediate)
    }

    return callback(intermediate)
  }

  /**
   * Returns the closure function to reduce the pipeline.
   *
   * @returns {Function}
   */
  private handle<R> (pipe: Pipe<T>, intermediate: T): R | Promise<R> {
    if (isClass(pipe)) {
      return this.handleClass(pipe, intermediate)
    }

    if (isFunction(pipe)) {
      // @ts-expect-error
      return pipe(intermediate)
    }

    throw new Error(`Pipeline tasks must be classes or functions. Received ${typeof pipe}`)
  }

  /**
   * Instantiate the given `Pipe` class and call the handle method.
   *
   * @param {Class} Pipe
   * @param {*} parameters
   *
   * @returns {*}
   */
  private handleClass (Pipe: any, parameters: T): any {
    const instance = new Pipe(parameters)

    return instance[this.method]()
  }

  /**
   * Returns the initial pipeline value.
   *
   * @returns {*}
   */
  private initial (): T {
    return this.pipeable
  }
}
