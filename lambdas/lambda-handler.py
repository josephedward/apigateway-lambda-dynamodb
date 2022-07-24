import requests
import boto3
import json

def main(event, context):
    response = requests.get('https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=MSFT&interval=1min&apikey=demo')
    jsonObj = json.loads(response.content)
    
    # pretty-printed object
    json_formatted_str = json.dumps(jsonObj, indent=4)
    

    # Create a DynamoDB table
    dynamodb = boto3.resource('dynamodb')
    
    # # If the table doesn't exist, create it
    # table = dynamodb.create_table(
    #     TableName='StockData',
    #     KeySchema=[
    #         {
    #             'AttributeName': 'symbol',
    #             'KeyType': 'HASH'  #Partition key
    #         },
    #         {
    #             'AttributeName': 'date',
    #             'KeyType': 'RANGE'  #Sort key
    #         }
    #     ],
    #     AttributeDefinitions=[
    #         {
    #             'AttributeName': 'symbol',
    #             'AttributeType': 'S'
    #         },
    #         {
    #             'AttributeName': 'date',
    #             'AttributeType': 'S'
    #         },
    #     ],
    #     ProvisionedThroughput={
    #         'ReadCapacityUnits': 10,
    #         'WriteCapacityUnits': 10
    #     }
    # )
    # print("Table status:", table.item_count)
    
    # # Put some data in the table
    # table.put_item(
    #     Item={
    #         'symbol': 'MSFT',
    #         'date': '2019-01-01',
    #         'open': '100.00',
    #         'high': '100.00',
    #         'low': '100.00',
    #         'close': '100.00',
    #         'volume': '100.00'
    #     }
    # )
    # table.put_item(
    #     Item={
    #         'symbol': 'MSFT',
    #         'date': '2019-01-02',
    #         'open': '100.00',
    #         'high': '100.00',
    #         'low': '100.00',
    #         'close': '100.00',
    #         'volume': '100.00'
    #     }
    # )
    # table.put_item(
    #     Item={
    #         'symbol': 'MSFT',
    #         'date': '2019-01-03',
    #         'open': '100.00',
    #         'high': '100.00',
    #         'low': '100.00',
    #         'close': '100.00',
    #         'volume': '100.00'
    #     }
    # )
    # table.put_item(
    #     Item={
    #         'symbol': 'MSFT',
    #         'date': '2019-01-04',

    # read the table
    table = dynamodb.Table('StockData')
    response = table.scan()
    print(response)

    # initial values for the DynamoDB table
    tempObj = [float(x) for x in list(list(jsonObj['Time Series (1min)'].values())[0].values())]
    openAvg= tempObj[0] 
    highAvg=tempObj[1] 
    lowAvg = tempObj[2] 
    closeAvg = tempObj[3] 
    volAvg = tempObj[4] 

    # Moving Average
    for x in jsonObj['Time Series (1min)']:
        tempObj = [float(x) for x in list(jsonObj['Time Series (1min)'][x].values())]
        openAvg = (openAvg+tempObj[0]) /2 
        highAvg = (highAvg+tempObj[1])/2
        lowAvg = (lowAvg+tempObj[2])/2
        closeAvg = (closeAvg+tempObj[3])/2
        volAvg = (volAvg+tempObj[4])/2
    
    print("Open: {:.2f}".format(openAvg))
    print("High: {:.2f}".format(highAvg))
    print("Low: {:.2f}".format(lowAvg))
    print("Close: {:.2f}".format(closeAvg))
    print("Volume: {:.2f}".format(volAvg))

    table = dynamodb.Table('stock_data')
    table.put_item(
        Item={
            'symbol': 'MSFT',
            'open': openAvg,
            'high': highAvg,
            'low': lowAvg,
            'close': closeAvg,
            'volume': volAvg
        }
    )
    
    #Update the table
    table.update_item(
        Key={
            'symbol': 'MSFT'
        },
        UpdateExpression="set open = :o, high = :h, low = :l, close = :c, volume = :v",
        ExpressionAttributeValues={
            ':o': openAvg,
            ':h': highAvg,
            ':l': lowAvg,
            ':c': closeAvg,
            ':v': volAvg
        }
    )
