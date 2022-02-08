[<img src="https://assets.arc.codes/architect-logo-500b@2x.png" width=500>](https://www.npmjs.com/package/@architect/plugin-rest-api)

## [`@architect/plugin-rest-api`](https://www.npmjs.com/package/@architect/plugin-rest-api)

> Architect plugin for deploying legacy API Gateway REST APIs

[![GitHub CI status](https://github.com/architect/plugin-rest-api/workflows/Node%20CI/badge.svg)](https://github.com/architect/plugin-rest-api/actions?query=workflow%3A%22Node+CI%22)


## Installation

```sh
npm i @architect/plugin-rest-api
```

Then add make sure your project manifest (usually `app.arc`) has the following two pragmas with (at least) these two settings:

```arc
@aws
apigateway rest

@plugins
architect/plugin-rest-api
```
