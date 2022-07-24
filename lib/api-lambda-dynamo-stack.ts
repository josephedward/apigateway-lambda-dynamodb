import { Stack, StackProps, Duration } from "aws-cdk-lib";
import { Construct } from "constructs";
import events = require("aws-cdk-lib/aws-events");
import targets = require("aws-cdk-lib/aws-events-targets");
import lambda = require("aws-cdk-lib/aws-lambda");
import * as ecr from "aws-cdk-lib/aws-ecr";
import fs = require("fs");
import { Handler, Runtime } from "aws-cdk-lib/aws-lambda";

export class ApiLambdaDynamoStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const lambdaFn = new lambda.Function(this, "Singleton", {
      code: new lambda.InlineCode(
        fs.readFileSync("./lambdas/lambda-handler.py", { encoding: "utf-8" })
      ),
      handler: "index.main",
      timeout: Duration.seconds(300),
      runtime: lambda.Runtime.PYTHON_3_7,
    });

    const rule = new events.Rule(this, "Rule", {
      schedule: events.Schedule.rate(Duration.minutes(1)),
    });

    rule.addTarget(new targets.LambdaFunction(lambdaFn));
  }
}
