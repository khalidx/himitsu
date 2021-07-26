import { SSMClient, paginateDescribeParameters, GetParametersCommand, ParameterMetadata } from '@aws-sdk/client-ssm'
import { SecretsManagerClient, paginateListSecrets, SecretListEntry, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager'

export const apiVersion = '2012-10-17'

/**
 * From https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints
 */
export function regions () {
  return [
    { regionName: 'US East (Ohio)', code: 'us-east-2' },
    { regionName: 'US East (N. Virginia)', code: 'us-east-1' },
    { regionName: 'US West (N. California)', code: 'us-west-1' },
    { regionName: 'US West (Oregon)', code: 'us-west-2' }
  ] as const
}

export function parameterStoreClient (region: string) {
  return new SSMClient({ region, apiVersion })
}

export function parameterStorePaginator (region: string) {
  return paginateDescribeParameters({ client: parameterStoreClient(region), pageSize: 10 }, { MaxResults: 10 })
}

export function getParameters (region: string, parameters: ParameterMetadata[]) {
  const client = parameterStoreClient(region)
  const command = new GetParametersCommand({
    WithDecryption: true,
    Names: parameters.map(parameter => parameter.Name!)
  })
  return client.send(command)
}

export function secretsManagerClient (region: string) {
  return new SecretsManagerClient({ region, apiVersion })
}

export function secretsManagerPaginator (region: string) {
  return paginateListSecrets({ client: secretsManagerClient(region), pageSize: 50 }, { MaxResults: 50 })
}

export function getSecrets (region: string, secrets: SecretListEntry[]) {
  const client = secretsManagerClient(region)
  const commands = secrets.map(secret => {
    return client
      .send(new GetSecretValueCommand({ SecretId: secret.Name }))
      .then(value => {
        return {
          name: value.Name,
          arn: value.ARN,
          value: value.SecretString ? value.SecretString : Buffer.from(value.SecretBinary!).toString('ascii')
        }
      })
  })
  return Promise.all(commands)
}
