#!/bin/bash

curl --request POST \
  --url https://api.line.me/v2/bot/message/push \
  --header "Authorization: Bearer $LINE_AUTHORIZATION" \
  --header 'content-type: application/json' \
  --data '{
    "to": "'$LINE_GROUP_ID'",
    "messages":[
        {
            "type":"text",
            "text":"face-service deploy done"
        }
    ]
}'