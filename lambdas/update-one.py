    # #Update the table
    # table.update_item(
    #     Key={
    #         'symbol': 'MSFT'
    #     },
    #     UpdateExpression="set open = :o, high = :h, low = :l, close = :c, volume = :v",
    #     ExpressionAttributeValues={
    #         ':o': openAvg,
    #         ':h': highAvg,
    #         ':l': lowAvg,
    #         ':c': closeAvg,
    #         ':v': volAvg
    #     }
    # )
