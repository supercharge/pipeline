<div align="center">
  <a href="https://superchargejs.com">
    <img width="471" style="max-width:100%;" src="https://superchargejs.com/images/supercharge-text.svg" />
  </a>
  <br/>
  <br/>
  <p>
    <h3>Pipeline</h3>
  </p>
  <p>
    Run a pipeline of async tasks
  </p>
  <br/>
  <p>
    <a href="#installation"><strong>Installation</strong></a> ·
    <a href="#Docs"><strong>Docs</strong></a> ·
    <a href="#usage"><strong>Usage</strong></a>
  </p>
  <br/>
  <br/>
  <p>
    <a href="https://www.npmjs.com/package/@supercharge/pipeline"><img src="https://img.shields.io/npm/v/@supercharge/pipeline.svg" alt="Latest Version"></a>
    <a href="https://www.npmjs.com/package/@supercharge/pipeline"><img src="https://img.shields.io/npm/dm/@supercharge/pipeline.svg" alt="Monthly downloads"></a>
  </p>
  <p>
    <em>Follow <a href="http://twitter.com/marcuspoehls">@marcuspoehls</a> and <a href="http://twitter.com/superchargejs">@superchargejs</a> for updates!</em>
  </p>
</div>

---

## Introduction
The `@supercharge/pipeline` package allows you to run a pipeline of async tasks. You’ll pipe an input serially through a list of (async) functions or classes. When using classes, you may define the called method on each class instance.


## Installation

```
npm i @supercharge/pipeline
```


## Docs
Find all the [details for `@supercharge/pipeline` in the extensive Supercharge docs](https://superchargejs.com/docs/pipeline).


## Usage
Using `@supercharge/pipeline` is pretty straightforward. Pass an array of classes or functions to a list and the pipeline sends the input through each stop.

For example, you may bootstrap an application by running a series of tasks:

```js
const App = require('./your-application')
const Pipeline = require('@supercharge/pipeline')

const app = await Pipeline
  .send(new App())
  .through([
    LoadEnvironment,
    InitializeAppConfig,
    RegisterRoutes,
    RegisterMiddleware,
    function logAppVersion (app) {
      console.log(app.version())

      return app
    }
  ])
  .then(async app => {
    await app.startServer()

    return app
  })
```

When using classes in a pipeline, the constructor receives the item you’re sending through the pipeline. In the example above, each class (e.g., `LoadEnvironment`) receives the `app` instance in the constructor.

A class instance for the pipeline may look like this:

```js
class LoadEnvironment {
  constructor (app) {
    this.app = app
  }

  async handle () {
    // do the heavy lifting
  }
}
```


### Using custom class methods
By default, the pipeline calls the `.handle()` method on class instances. You may change the method using the `Pipeline.via` method:

```js
const App = require('./your-application')
const Pipeline = require('@supercharge/pipeline')

const app = await Pipeline
  .send(new App())
  .through([
    …
  ])
  .via('methodName')
  .then(…)
```


### And then return…
A pipeline starts when calling the `.then` method. The `then` method requires a callback as a parameter. You can skip the last stop (the callback of `then`) by directly returning the result of the pipeline using the `.thenReturn` method:

```js
const app = await Pipeline
  .send(new App())
  .through([ … ])
  .via('methodName')
  .thenReturn()
```

## Credits and Love to Laravel
The idea for this package comes from the [Laravel](https://laravel.com) PHP framework. Laravel contains a pipeline package providing the idea for this package. This package provides the same API as the Laravel pipeline package. A huge thank you goes to Laravel, being a great inspiration ❤️


## Contributing
Do you miss a function? We very much appreciate your contribution! Please send in a pull request 😊

1.  Create a fork
2.  Create your feature branch: `git checkout -b my-feature`
3.  Commit your changes: `git commit -am 'Add some feature'`
4.  Push to the branch: `git push origin my-new-feature`
5.  Submit a pull request 🚀


## License
MIT © [Supercharge](https://superchargejs.com)

---

> [superchargejs.com](https://superchargejs.com) &nbsp;&middot;&nbsp;
> GitHub [@superchargejs](https://github.com/superchargejs/) &nbsp;&middot;&nbsp;
> Twitter [@superchargejs](https://twitter.com/superchargejs)
