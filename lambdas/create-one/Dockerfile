FROM public.ecr.aws/lambda/python:3.9

COPY create-one.py ${LAMBDA_TASK_ROOT}

# don't need a custom runtime for now
# COPY requirements.txt .

RUN pip3 install -r requirements.txt --target "${LAMBDA_TASK_ROOT}"

ENV APP_VERSION=1.0.0

CMD \[ "create-one.handler" \]