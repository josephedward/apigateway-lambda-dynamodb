from urllib import response
import boto3
import json
import os
import requests

def main(event, context):
    try:
        response = json.loads(requests.get(
            'https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=MSFT&interval=1min&apikey=demo').content)
    except:
        return{
            'statusCode': 200,
            'body': "unable to read event body"
        }

    dynamodb = boto3.resource('dynamodb')
    dateString = list(response['Meta Data']['3. Last Refreshed'].split(" "))[0]
    timeString = list(response['Meta Data']['3. Last Refreshed'].split(" "))[1]
    stockData = response['Time Series (1min)']
    print("dateString: " + dateString)
    print("timeString: " + timeString)
    table = dynamodb.Table('StockData')

    try:
        table.put_item(
            Item={
                'dateString': dateString,
                'timeString': timeString,
                'stock_data': stockData
            },
            Condition= Key('dateString').ne(dateString) and Key('timeString').ne(timeString)       # if the item already exists, don't put it again     
        )
        print("Stock data added to DynamoDB")
        return{
            'statusCode': 200,
            'body': "Stock data added to DynamoDB"
        }
    except:
        print("Stock data already exists in DynamoDB")
        return{
            'statusCode': 200,
            'body': "Stock data was not added to DynamoDB"
        }
