import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as ApiLambdaDynamo from '../lib/api-lambda-dynamo-stack';

test('Api Gateway Created', () => { 
    const app = new cdk.App();
      // WHEN
    const stack = new ApiLambdaDynamo.ApiLambdaDynamoStack(app, 'MyTestStack');
      // THEN
    const template = Template.fromStack(stack);
  
    template.hasResourceProperties('AWS::ApiGateway::RestApi', {
      Name: 'api-lambda-dynamo',
    });
  })


test('DynamoDB Table Created', () => {
  const app = new cdk.App();
    // WHEN
  const stack = new ApiLambdaDynamo.ApiLambdaDynamoStack(app, 'MyTestStack');
    // THEN
  const template = Template.fromStack(stack);

  template.hasResourceProperties('AWS::DynamoDB::Table', {
    TableName: 'StockData',
    AttributeDefinitions: [
        {
            AttributeName: 'dateString',
            AttributeType: 'S',
        },
        {
            AttributeName: 'timestamp',
            AttributeType: 'S',
        },
    ],
    KeySchema: [
        {
            AttributeName: 'dateString',
            KeyType: 'HASH',
        },
        {
            AttributeName: 'timestamp',
            KeyType: 'RANGE',
        },
    ]
    }) 
});

test('Lambda Function Created', () => { 
  const app = new cdk.App();
    // WHEN
  const stack = new ApiLambdaDynamo.ApiLambdaDynamoStack(app, 'MyTestStack');
    // THEN
  const template = Template.fromStack(stack);

  template.hasResourceProperties('AWS::Lambda::Function', {
    FunctionName: 'create-one',
    Handler: 'index.main',
    MemorySize: 128,
    Role: 'arn:aws:iam::123456789012:role/lambda-dynamo-role',
    Runtime: 'python3.7',
    Timeout: 300,
    Environment: {
      Variables: {
        PRIMARY_KEY: 'dateString',
        SORT_KEY: 'timestamp',
        TABLE_NAME: 'StockData',
      },
    },
  });
})


test('Lambda Function Created', () => { 
  const app = new cdk.App();
    // WHEN
  const stack = new ApiLambdaDynamo.ApiLambdaDynamoStack(app, 'MyTestStack');
    // THEN
  const template = Template.fromStack(stack);

  template.hasResourceProperties('AWS::Lambda::Function', {
    FunctionName: 'get-one',
    Handler: 'index.main',
    MemorySize: 128,
    Role: 'arn:aws:iam::123456789012:role/lambda-dynamo-role',
    Runtime: 'python3.7',
    Timeout: 300,
    Environment: {
      Variables: {
        PRIMARY_KEY: 'dateString',
        SORT_KEY: 'timestamp',
        TABLE_NAME: 'StockData',
      },
    },
  });
})


test('Lambda Function Created', () => { 
  const app = new cdk.App();
    // WHEN
  const stack = new ApiLambdaDynamo.ApiLambdaDynamoStack(app, 'MyTestStack');
    // THEN
  const template = Template.fromStack(stack);

  template.hasResourceProperties('AWS::Lambda::Function', {
    FunctionName: 'get-all',
    Handler: 'index.main',
    MemorySize: 128,
    Role: 'arn:aws:iam::123456789012:role/lambda-dynamo-role',
    Runtime: 'python3.7',
    Timeout: 300,
    Environment: {
      Variables: {
        PRIMARY_KEY: 'dateString',
        SORT_KEY: 'timestamp',
        TABLE_NAME: 'StockData',
      },
    },
  });
})

