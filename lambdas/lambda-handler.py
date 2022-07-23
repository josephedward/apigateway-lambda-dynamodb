import requests

def main(event, context):
    print("I'm running!")
    print(event)
    print(context)
    response = requests.get('https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=MSFT&interval=1min&apikey=demo')
    print(response.content)

    # RGSDVNOEJSMD5S60