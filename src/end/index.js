let aws = require('aws-sdk')
let { toLogicalID } = require('@architect/utils')

module.exports = async function legacyAPIpatch (params) {
  let { inventory, stage } = params
  let { inv } = inventory
  let { region } = inv.aws

  if (!inv.http?.length || inv.aws.apigateway !== 'rest' || !stage) return

  let cfn = new aws.CloudFormation({ region })
  let apigateway = new aws.APIGateway({ region })
  let name = stage === 'production' ? 'Production' : 'Staging'

  let data = await cfn.describeStacks({ StackName: `${toLogicalID(inv.app)}${name}` }).promise()
  let restApiId
  if (Array.isArray(data.Stacks)) {
    let outs = data.Stacks[0].Outputs
    let value = outs.find(({ OutputKey }) => [ 'restApiId', 'ApiId' ].includes(OutputKey))
    restApiId = value?.OutputValue
    if (!restApiId) throw ReferenceError('REST API not found!')
  }
  else throw Error('CloudFormation stack not found!')

  // Update binary media types to `*/*`
  await apigateway.updateRestApi({
    restApiId,
    patchOperations: [ {
      op: 'add',
      path: '/binaryMediaTypes/*~1*'
    } ]
  }).promise()

  // Deploy the changes
  await apigateway.createDeployment({
    restApiId,
    stageName: stage
  }).promise()
}
