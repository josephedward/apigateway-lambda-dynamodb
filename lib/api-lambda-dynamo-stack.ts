import { Stack, StackProps, Duration, App, RemovalPolicy } from "aws-cdk-lib";
import { Construct } from "constructs";
import events = require("aws-cdk-lib/aws-events");
import targets = require("aws-cdk-lib/aws-events-targets");
import lambda = require("aws-cdk-lib/aws-lambda");
import * as ecr from "aws-cdk-lib/aws-ecr";
import fs = require("fs");
// import {lambda, Handler } from "aws-cdk-lib/aws-lambda";
import {
  IResource,
  LambdaIntegration,
  MockIntegration,
  PassthroughBehavior,
  RestApi,
} from "aws-cdk-lib/aws-apigateway";
import { AttributeType, Table } from "aws-cdk-lib/aws-dynamodb";
// import { Runtime } from 'aws-cdk-lib/aws-lambda';
// import { join } from 'path'

export class ApiLambdaDynamoStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    //

    // // # If the table doesn't exist, create it
    // table = dynamodb.create_table(
    //   TableName = 'StockData',
    //   KeySchema = [
    //     {
    //       'AttributeName': 'symbol',
    //       'KeyType': 'HASH'  #Partition key
    //     },
    //     {
    //       'AttributeName': 'dateString',
    //       'KeyType': 'RANGE'  #Sort key
    //     }
    //   ],
    //   AttributeDefinitions = [
    //     {
    //       'AttributeName': 'symbol',
    //       'AttributeType': 'S'
    //     },
    //     {
    //       'AttributeName': 'dateString',
    //       'AttributeType': 'S'
    //     },
    //   ],
    //   ProvisionedThroughput = {
    //     'ReadCapacityUnits': 10,
    //     'WriteCapacityUnits': 10
    //   }
    // )
    // print("Table status:", table.item_count)

    // # Put some data in the table
    // table.put_item(
    //   Item = {
    //     'symbol': 'MSFT',
    //     'dateString': '2019-01-01',
    //     'open': '100.00',
    //     'high': '100.00',
    //     'low': '100.00',
    //     'close': '100.00',
    //     'volume': '100.00'
    //   }
    // )
    // table.put_item(
    //   Item = {
    //     'symbol': 'MSFT',
    //     'dateString': '2019-01-02',
    //     'open': '100.00',
    //     'high': '100.00',
    //     'low': '100.00',
    //     'close': '100.00',
    //     'volume': '100.00'
    //   }
    // )
    // table.put_item(
    //   Item = {
    //     'symbol': 'MSFT',
    //     'dateString': '2019-01-03',
    //     'open': '100.00',
    //     'high': '100.00',
    //     'low': '100.00',
    //     'close': '100.00',
    //     'volume': '100.00'
    //   }
    // )

    const dynamoTable = new Table(this, "StockData", {
      partitionKey: {
        name: "dateString",
        type: AttributeType.STRING,
      },
      sortKey: {
        name: "timestamp",
        type: AttributeType.STRING,
      },
      tableName: "StockData",
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const createOneLambda = new lambda.Function(this, "createOneFunction", {
      code: new lambda.InlineCode(
        fs.readFileSync("./lambdas/create-one.py", { encoding: "utf-8" })
      ),
      handler: "index.main",
      timeout: Duration.seconds(300),
      runtime: lambda.Runtime.PYTHON_3_7,
      environment: {
        PRIMARY_KEY: "dateString",
        SORT_KEY: "timestamp",
        TABLE_NAME: dynamoTable.tableName,
      },
    });

    const getOneLambda = new lambda.Function(this, "getOneFunction", {
      code: new lambda.InlineCode(
        fs.readFileSync("./lambdas/get-one.py", { encoding: "utf-8" })
      ),
      handler: "index.main",
      timeout: Duration.seconds(300),
      runtime: lambda.Runtime.PYTHON_3_7,
      environment: {
        PRIMARY_KEY: "dateString",
        SORT_KEY: "timestamp",
        TABLE_NAME: dynamoTable.tableName,
      },
    });

    const getAllLambda = new lambda.Function(this, "getAllFunction", {
      code: new lambda.InlineCode(
        fs.readFileSync("./lambdas/get-all.py", { encoding: "utf-8" })
      ),
      handler: "index.main",
      timeout: Duration.seconds(300),
      runtime: lambda.Runtime.PYTHON_3_7,
      environment: {
        PRIMARY_KEY: "dateString",
        SORT_KEY: "timestamp",
        TABLE_NAME: dynamoTable.tableName,
      },
    });

    dynamoTable.grantReadWriteData(getOneLambda);
    dynamoTable.grantReadWriteData(createOneLambda);
    dynamoTable.grantReadWriteData(getAllLambda);
    const createOneIntegration = new LambdaIntegration(createOneLambda);
    const getOneIntegration = new LambdaIntegration(getOneLambda);
    const getAllIntegration = new LambdaIntegration(getAllLambda);

    const api = new RestApi(this, "stockDataApi", {
      restApiName: "stockDataApi",
    });

    const stockData = api.root.addResource("StockData");
    stockData.addMethod("POST", createOneIntegration);
    addCorsOptions(stockData);

    const singleDateString = stockData.addResource("{dateString}");
    singleDateString.addMethod("GET", getOneIntegration);
    addCorsOptions(singleDateString);

    const allDateStrings = stockData.addResource("all");
    allDateStrings.addMethod("GET", getAllIntegration);
    addCorsOptions(allDateStrings);
  }

  // for cronjob to update the data, singleton function, if I get time to do that

  // const rule = new events.Rule(this, "Rule", {
  //   schedule: events.Schedule.rate(Duration.minutes(1)),
  // });

  // rule.addTarget(new targets.LambdaFunction(lambdaFn));
}

export function addCorsOptions(apiResource: IResource) {
  apiResource.addMethod(
    "OPTIONS",
    new MockIntegration({
      integrationResponses: [
        {
          statusCode: "200",
          responseParameters: {
            "method.response.header.Access-Control-Allow-Headers":
              "'Content-Type,X-Amz-date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent'",
            "method.response.header.Access-Control-Allow-Origin": "'*'",
            "method.response.header.Access-Control-Allow-Credentials":
              "'false'",
            "method.response.header.Access-Control-Allow-Methods":
              "'OPTIONS,GET,PUT,POST,DELETE'",
          },
        },
      ],
      passthroughBehavior: PassthroughBehavior.NEVER,
      requestTemplates: {
        "application/json": '{"statusCode": 200}',
      },
    }),
    {
      methodResponses: [
        {
          statusCode: "200",
          responseParameters: {
            "method.response.header.Access-Control-Allow-Headers": true,
            "method.response.header.Access-Control-Allow-Methods": true,
            "method.response.header.Access-Control-Allow-Credentials": true,
            "method.response.header.Access-Control-Allow-Origin": true,
          },
        },
      ],
    }
  );
}
