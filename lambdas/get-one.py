import requests
import boto3
import json

TABLE_NAME = process.env.TABLE_NAME
PRIMARY_KEY = process.env.PRIMARY_KEY

def main(event, context):
    print("event :". event)
    print("context : ", context)
    dynamodb = boto3.resource('dynamodb')

    # get time series data by date from DynamoDB
    table = dynamodb.Table(TABLE_NAME)
    # find the date in the table
    response = table.get_item(
        Key={
            PRIMARY_KEY: event[PRIMARY_KEY]
        }
    )
    # get the data from the table
    data = response['Item']
    # convert the data to a json string
    json_str = json.dumps(data)
    # convert the json string to a json object
    pretty_printed = json.dumps(json.loads(json_str), indent=4)
    return {
        "statusCode": 200,
        'body': pretty_printed
    }

    
    # response = table.get_item(
    # )
    # # get the data from the table
    # data = response['Item']
    # # convert the data to a json string
    # json_str = json.dumps(data)
    # # convert the json string to a json object
    # json_obj = json.loads(json_str)
    # # pretty-printed object
    # json_formatted_str = json.dumps(json_obj, indent=4)
    # # return the json string
    # return json_formatted_str

        
        
            

    # # initial values for the DynamoDB table
    # tempObj = [float(x) for x in list(
    #     list(jsonObj['Time Series (1min)'].values())[0].values())]
    # openAvg = tempObj[0]
    # highAvg = tempObj[1]
    # lowAvg = tempObj[2]
    # closeAvg = tempObj[3]
    # volAvg = tempObj[4]

    # # Moving Average

    # for x in jsonObj['Time Series (1min)']:
    #     tempObj = [float(x) for x in list(
    #         jsonObj['Time Series (1min)'][x].values())]
    #     openAvg = (openAvg+tempObj[0]) / 2
    #     highAvg = (highAvg+tempObj[1])/2
    #     lowAvg = (lowAvg+tempObj[2])/2
    #     closeAvg = (closeAvg+tempObj[3])/2
    #     volAvg = (volAvg+tempObj[4])/2

    # print("Open: {:.2f}".format(openAvg))
    # print("High: {:.2f}".format(highAvg))
    # print("Low: {:.2f}".format(lowAvg))
    # print("Close: {:.2f}".format(closeAvg))
    # print("Volume: {:.2f}".format(volAvg))

    # return {
    #     'open': openAvg,
    #     'high': highAvg,
    #     'low': lowAvg,
    #     'close': closeAvg,
    #     'volume': volAvg
    # }
