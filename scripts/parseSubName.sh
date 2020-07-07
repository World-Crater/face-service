#!/bin/bash

mkdir subNamePage
go run parseSubName.go
node parseSubName.js
rm -r subNamePage