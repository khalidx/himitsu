# himitsu

A simple command line application to discover all keys that hold a specific value across AWS SSM Parameter Store and Secrets Manager.

*What can you do with this tool?*

Simply provide a value, like a password, to discover all keys in your AWS account that equal that value. This is useful during password changes, or when you believe that a secret value has been compromised.

*What is "himitsu"?*

The Japanese word for "secret".

## usage

```sh
himitsu
```

You'll be prompted for the value to search for.

`himitsu` uses the currently logged in AWS account by default, and will only be able to search the keys the currently logged in user has access to. It also only compares the value of the current version of the secret. It searches only the following AWS regions (for now):

- `us-east-1` | US East (N. Virginia)
- `us-east-2` | US East (Ohio)
- `us-west-1` | US West (N. California)
- `us-west-2` | US West (Oregon)

The implementation is simple, and contained in [src/index.ts](./src/index.ts).

You'll need at least the following IAM policy associated with currently logged in user. Of course, if you're logged in as an administrator user or root, you won't need to add this policy. You can also further restrict the resources section of the policy to only allow the logged in user and `himitsu` to have access to certain secrets in your AWS account.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ssm:DescribeParameters"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:ListSecrets"
      ],
      "Resource": "*"
    }
  ]
}
```

## support

Your comments, concerns, suggestions, and feedback are all appreciated. Help maintain this project by opening an issue or pull request!
