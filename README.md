# Testing Payments linking

App to let the instore app and instore payments apps to test their linking features.

## Docs

See [docs](https://github.com/vtex/vtex-payment-test/blob/master/docs/) folder to know how to create an instore vtex payment app

## Linking to your app

This app links to an app that accept the uri stone://payment?params (see the docs folder above to know how it works).

You can easily change the scheme from "stone" to your app's scheme by editing the render method of https://github.com/vtex/vtex-payment-test/blob/master/App.js

## Linking back to this app

You can link back to this app with the URI:

vtex-payment-test://payment?params // for payment applinking
vtex-payment-test://payment-reversal?params // for a refund applinking

## Development

Execute any make command on the terminal of your machine (normally works on Linux and Mac).

### Setup project

make setup (need node and npm installed on your machine)

### Run on iOS simulator

make run (or make ios)

### Run on iOS device

See [Running on Device](http://facebook.github.io/react-native/docs/running-on-device.html)

### Run on Android emulator / device via command line

make android

### Run on Android emulator / device via Android Studio

make setup (if not already executed, remember: need node and npm installed on your machine)

make server (it starts react native packager to bundle javascript)

Open directory vtex-payment-test/android on Android Studio.

Run as a normal Android app.

Dismiss any initial red error (like bridge error or could not connect to local server), after the app initialize.

Shake the device to open developer options.
Choose Dev Settings, then choose "Debug server host & port for device".
Then insert the IP Address of the machine that you executed the `make server` command with the port 8081, example: 10.1.12.4:8081

If you want to make changes to javascript to change parameters on links, you can edit App.js file and then shake the device again and press "Reload".
