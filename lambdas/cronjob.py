from urllib import response
import boto3
import json
import os
import requests


def main(event, context):
    try:

        response = json.loads(requests.get(
            'https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=MSFT&interval=1min&apikey=demo').content)
        print(response)
    except:
        return{
            'statusCode': 200,
            'body': "unable to read event body"
        }

    dynamodb = boto3.resource('dynamodb')
    dateString = list(response['Meta Data']['3. Last Refreshed'].split(" "))[0]
    timeString = list(response['Meta Data']['3. Last Refreshed'].split(" "))[1]
    stockData = response['Time Series (1min)']

    table = dynamodb.Table('StockData')

    try:
        table.put_item(
            Item={
                'dateString': dateString,
                'timeString': timeString,
                'stock_data': stockData
            },
            ConditionExpression='attribute_not_exists(dateString) AND attribute_not_exists(timeString)'
        )
        return{
            'statusCode': 200,
            'body': "Stock data added to DynamoDB"
        }
    except:
        return{
            'statusCode': 200,
            'body': "Stock data was not added to DynamoDB"
        }
