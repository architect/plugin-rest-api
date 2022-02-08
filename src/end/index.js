let aws = require('aws-sdk')
let { toLogicalID } = require('@architect/utils')

module.exports = async function legacyAPIpatch (params) {
  let { inventory, deployStage } = params
  let { inv } = inventory
  let { region } = inv.aws

  if (!inv.http?.length || inv.aws.apigateway !== 'rest' || !deployStage) return

  let cfn = new aws.CloudFormation({ region })
  let apigateway = new aws.APIGateway({ region })
  let stage = deployStage === 'production' ? 'Production' : 'Staging'

  let data = cfn.describeStacks({ StackName: `${toLogicalID(inv.app)}${stage}` }).promise()
  let restApiId
  if (Array.isArray(data.Stacks)) {
    let outs = data.Stacks[0].Outputs
    let value = outs.find(o => o.OutputKey === 'restApiId')
    restApiId = value.OutputValue
    if (!restApiId) return
  }
  else throw Error('stack_not_found')

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
    stageName: deployStage
  }).promise()
}
