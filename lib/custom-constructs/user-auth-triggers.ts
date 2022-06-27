import { Construct } from "constructs";
import * as cdk from 'aws-cdk-lib'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as nodeLambda from 'aws-cdk-lib/aws-lambda-nodejs'
export class UserAuthTriggers extends Construct {
    preSignUpTrigger: cdk.aws_lambda_nodejs.NodejsFunction;
    postConfirmTrigger: cdk.aws_lambda_nodejs.NodejsFunction;
    props: { table: cdk.aws_dynamodb.Table; };
    preAuthTrigger: cdk.aws_lambda_nodejs.NodejsFunction;

    constructor(scope: Construct, id: string, props: {
        table: cdk.aws_dynamodb.Table,
    }) {
        super(scope, id)
        this.props = props
        
        /**
         * pre signup school trigger lambda, invoked before signup of a lambda function
         */
        this.preSignUpTrigger = new nodeLambda.NodejsFunction(this, "PreSignUpUserTrigger", 
        this.lambdaConfig(
            "./apps/backend/lambdas/pre-signup-user.ts",
            "pre user signup trigger"
        ))

        
        
        /**
         * post confirm school trigger, invoked after signup of a lambda function
         */
        this.postConfirmTrigger = new nodeLambda.NodejsFunction(this, "PostConfirmUserTrigger", 
        this.lambdaConfig(
            "./apps/backend/lambdas/post-confirm-user.ts",
            "post user confirm trigger"
        ))

        this.preAuthTrigger = new nodeLambda.NodejsFunction(this,"preAuthUserTrigger",
        this.lambdaConfig(
            "./apps/backend/lambdas/pre-auth-user.ts",
            "pre auth user trigger"
        ))

    }

    lambdaConfig(entry: string,description: string): nodeLambda.NodejsFunctionProps {
        return {
            runtime: lambda.Runtime.NODEJS_16_X,
            handler: 'handler',
            entry: entry,
            description: description,
            depsLockFilePath: './yarn.lock',
            memorySize: cdk.Size.mebibytes(512).toMebibytes(),
            timeout: cdk.Duration.seconds(25),
            environment: {
                'TABLE_NAME': this.props.table.tableName,
                'TABLE_REGION': this.props.table.tableArn.split(':')[3],
              
            },
            bundling: {
                externalModules: ['aws-sdk'],
                footer: '/*global handler*/',
                minify: true,
                format: nodeLambda.OutputFormat.CJS,
                sourceMap: true,
                sourcesContent: false,
                sourceMapMode: nodeLambda.SourceMapMode.DEFAULT,
                metafile: true,
                forceDockerBundling: false
            }
        }
    }
    


}