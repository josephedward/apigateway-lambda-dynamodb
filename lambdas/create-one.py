import requests
import boto3
import json


def main(event, context):
    print("event :". event)
    print("context : ", context)
    dynamodb = boto3.resource('dynamodb')

    # get time series data by date from DynamoDB
    # table = dynamodb.Table('StockData')
    # # find the date in the table
    # response = table.get_item(
    # )
    # # get the data from the table
    # data = response['Item']
    # # convert the data to a json string
    # json_str = json.dumps(data)
    # # convert the json string to a json object
    # pretty-printed object
    # json_formatted_str = json.dumps(jsonObj, indent=4)

    # table = dynamodb.Table('StockData')
    # table.put_item(
    #     json_formatted_str
    # )

    # return {
    #     "statusCode": 200,
    #     'body': "Successfully created item in table"
    # }
