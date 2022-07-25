import requests
import boto3
import json


def main(event, context):
    try:
        body = json.loads(event['body'])
    except:
        return{
            'statusCode': 200,
            'body': "unable to read event body"
        }

    dynamodb = boto3.resource('dynamodb')
    dateString = list(body['Meta Data'].values())[2].split(" ")[0]
    timeStamp = list(body['Meta Data'].values())[2].split(" ")[1]
    print(dateString)
    print(timeStamp)
    
    
    # get time series data by dateString from DynamoDB
    table = dynamodb.Table('StockData')
    
    # put time series data into DynamoDB
    table.put_item(
        Item={
            'dateString': dateString,
            'timestamp' : timeStamp,
            'stock_data': body['Time Series (1min)']
        }
    )

    return {
        "statusCode": 200,
        'body': "Successfully created item in table"
    }
