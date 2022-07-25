import requests
import boto3
import json


def main(event, context):
    try:
        body = json.loads(event['body'])
    except Exception, e:
        return{
            'statusCode': 200,
            'body': "unable to read event body"
        }

    dynamodb = boto3.resource('dynamodb')
    date = list(body['Meta Data'].values())[2].split(" ")[0]
    timeStamp = list(body['Meta Data'].values())[2].split(" ")[1]
    print(date)
    print(timeStamp)
    
    
    # get time series data by date from DynamoDB
    table = dynamodb.Table('StockData')
    
    # put time series data into DynamoDB
    table.put_item(
        Item={
            'date': date,
            'timestamp' : timeStamp,
            'stock_data': body['Time Series (1min)']
        }
    )

    return {
        "statusCode": 200,
        'body': "Successfully created item in table"
    }
