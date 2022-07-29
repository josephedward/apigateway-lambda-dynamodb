import boto3
import json
import os

def main(event, context):
    dynamodb = boto3.resource('dynamodb')
    table = dynamodb.Table('StockData')
    response = table.scan()
    return {
        "statusCode": 200,
        "body": json.dumps(response['Items'])
    }
    
