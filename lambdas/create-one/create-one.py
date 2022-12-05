import requests
import boto3

import json
import time 
imp


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
    timeString = list(body['Meta Data'].values())[2].split(" ")[1]
    print(dateString)
    print(timeString)

    table = dynamodb.Table('StockData')

    table.put_item(
        Item={
            'dateString': strftime("%Y-%m-%d", time.strptime(dateString, "%Y-%m-%d")),
            'timeString': timeString,
            'stock_data': body['Time Series (1min)']
        }
    )

    return {
        "statusCode": 200,
        'body': "Successfully created item in table"
    }
