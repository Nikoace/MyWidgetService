import { Construct } from "constructs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3 from "aws-cdk-lib/aws-s3";

export class WidgetService extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const bucket = new s3.Bucket(this, "WidgetStore");

    const handler = new lambda.Function(this, "WidgetHandler", {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset("resources"),
      handler: "widgets.main",
      environment: {
        BUCKET: bucket.bucketName
      }
    });

    bucket.grantReadWrite(handler);

    const api = new apigateway.RestApi(this, "weights-api", {
      restApiName: "Weight Service",
      description: "This is service serves widgets."
    })

    const getWeightsIntegration = new apigateway.LambdaIntegration(handler, {
      requestTemplates: {"application/json": '{"statusCode": "200"}'}
    });
    api.root.addMethod("GET", getWeightsIntegration);

    const widget = api.root.addResource("{id}");
    const widgetIntegration = new apigateway.LambdaIntegration(handler);
    widget.addMethod("POST", widgetIntegration)
    widget.addMethod("GET", widgetIntegration)
    widget.addMethod("DELETE", widgetIntegration)
  }
}
