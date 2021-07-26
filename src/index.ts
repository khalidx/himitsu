import { regions, parameterStorePaginator, getParameters, secretsManagerPaginator, getSecrets } from "./aws"

/**
 * For each region,
 * list all the parameters in the AWS SSM Parameter Store in that region,
 * retrieve the values for all the parameters,
 * list all the secrets in the AWS Secrets Manager in that region,
 * retrieve the values for all the secrets,
 * compare each value in both lists against the user-provided search value,
 * and return a list of parameters and secrets that exactly match or contain the value.
 */
export function search (value: string) {
  return matches(value)
}

export async function matches (value: string) {
  const matches = [
    ...await matchesFromParameterStore(value),
    ...await matchesFromSecretsManager(value)
  ]
  const message = matches.length === 0 ? 'No results found' : matches.length === 1 ? '1 result found' : `${matches.length} results found`
  return { matches, message }
}

export type Match = {
  name: string
  arn: string
  match: 'exact' | 'contains'
}

export async function matchesFromParameterStore (value: string) {
  const matches: Match[] = []
  for (const region of regions()) {
    for await (const page of parameterStorePaginator(region.code)) {
      if (page.Parameters && page.Parameters.length > 0) {
        const { Parameters } = await getParameters(region.code, page.Parameters)
        if (Parameters) {
          for (const parameter of Parameters) {
            if (parameter.Value?.includes(value)) {
              matches.push({
                name: parameter.Name!,
                arn: parameter.ARN!,
                match: parameter.Value === value ? 'exact' : 'contains'
              })
            }
          }
        }
      }
    }
  }
  return matches
}

export async function matchesFromSecretsManager (value: string) {
  const matches: Match[] = []
  for (const region of regions()) {
    for await (const page of secretsManagerPaginator(region.code)) {
      if (page.SecretList && page.SecretList.length > 0) {
        const secrets = await getSecrets(region.code, page.SecretList)
        for (const secret of secrets) {
          if (secret.value.includes(value)) {
            matches.push({
              name: secret.name!,
              arn: secret.arn!,
              match: secret.value === value ? 'exact' : 'contains'
            })
          }
        }
      }
    }
  }
  return matches
}
