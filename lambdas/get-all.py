import boto3
import json
import os

def main():
    table = dynamodb.Table('StockData')
    response = table.scan()
    return(response)
