import { Stack, StackProps, Duration, App, RemovalPolicy } from "aws-cdk-lib";
import { Construct } from "constructs";
import lambda = require("aws-cdk-lib/aws-lambda");
import fs = require("fs");
import {
  IResource,
  LambdaIntegration,
  MockIntegration,
  PassthroughBehavior,
  RestApi,
} from "aws-cdk-lib/aws-apigateway";
import { AttributeType, Table } from "aws-cdk-lib/aws-dynamodb";
import events = require("aws-cdk-lib/aws-events");
import targets = require("aws-cdk-lib/aws-events-targets");

export class ApiLambdaDynamoStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const dynamoTable = new Table(this, "StockData", {
      partitionKey: {
        name: "dateString",
        type: AttributeType.STRING,
      },
      sortKey: {
        name: "timeString",
        type: AttributeType.STRING,
      },
      tableName: "StockData",
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const createOneLambda = new lambda.Function(this, "createOneFunction", {
      functionName: "createOneFunction",
      code: new lambda.InlineCode(
        fs.readFileSync("./lambdas/create-one/create-one.py", { encoding: "utf-8" })
      ),
      handler: "index.main",
      timeout: Duration.seconds(300),
      runtime: lambda.Runtime.PYTHON_3_7,
      memorySize: 128,
      environment: {
        PRIMARY_KEY: "dateString",
        SORT_KEY: "timeString",
        TABLE_NAME: "StockData",
      },
    });

    const getOneLambda = new lambda.Function(this, "getOneFunction", {
      functionName: "getOneFunction",
      code: new lambda.InlineCode(
        fs.readFileSync("./lambdas/get-one.py", { encoding: "utf-8" })
      ),
      handler: "index.main",
      timeout: Duration.seconds(300),
      runtime: lambda.Runtime.PYTHON_3_7,
      memorySize: 128,
      environment: {
        PRIMARY_KEY: "dateString",
        SORT_KEY: "timeString",
        TABLE_NAME: "StockData",
      },
    });

    const getAllLambda = new lambda.Function(this, "getAllFunction", {
      functionName: "getAllFunction",
      code: new lambda.InlineCode(
        fs.readFileSync("./lambdas/get-all.py", { encoding: "utf-8" })
      ),
      handler: "index.main",
      timeout: Duration.seconds(300),
      runtime: lambda.Runtime.PYTHON_3_7,
      memorySize: 128,
      environment: {
        PRIMARY_KEY: "dateString",
        SORT_KEY: "timeString",
        TABLE_NAME: "StockData",
      },
    });

    const cronJobLambda = new lambda.Function(this, "cronJobFunction", {
      functionName: "cronJobFunction",
      code: new lambda.InlineCode(
        fs.readFileSync("./lambdas/cronjob.py", { encoding: "utf-8" })
      ),
      handler: "index.main",
      timeout: Duration.seconds(300),
      runtime: lambda.Runtime.PYTHON_3_7,
      memorySize: 128,
      environment: {
        PRIMARY_KEY: "dateString",
        SORT_KEY: "timeString",
        TABLE_NAME: "StockData",
      },
    });

    // daily cronjob to update the data, singleton function
    const rule = new events.Rule(this, "Rule", {
      schedule: events.Schedule.rate(Duration.hours(1)),
      targets: [new targets.LambdaFunction(cronJobLambda)],
    });

    dynamoTable.grantReadWriteData(getOneLambda);
    dynamoTable.grantReadWriteData(createOneLambda);
    dynamoTable.grantReadWriteData(getAllLambda);
    dynamoTable.grantReadWriteData(cronJobLambda);

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
            "method.response.header.Access-Control-Allow-Origin": true,
          },
        },
      ],
    }
  );
}
