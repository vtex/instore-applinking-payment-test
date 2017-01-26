# Before anything else
THIS_FILE := $(lastword $(MAKEFILE_LIST))

.PHONY: run build android

help:
	@echo "Available Targets:"
	@cat Makefile | egrep '^([-a-zA-Z]+?):' | sed 's/:\(.*\)//g' | sed 's/^/- /g'

setup:
	npm install

run:
	react-native run-ios

android:
	react-native run-android

server:
	npm start

ios: run

test:
	npm test
