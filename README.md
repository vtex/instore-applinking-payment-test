# Testing Payments linking

Example to help inStore app and payment apps test their linking features.

## Docs

See [docs](http://instore.vtex.com/applinking) to know how to create a payment app that communicates with inStore app.

## Linking to your app

This app represents inStore role (the POS app that calls a payment app), so it links to an app that accepts the uri `stone://payment?params` (see the [docs](http://instore.vtex.com/applinking) to know how it works).

You can easily change the scheme from "stone" to your app's scheme by editing the render method of https://github.com/vtex/vtex-payment-test/blob/master/App.js

## Linking back to this app

You can link back to this app calling the URI:

```
vtex-payment-test://payment?params // for payment applinking
vtex-payment-test://payment-reversal?params // for a refund applinking
```

## Example of a payment app

You can see an Android payment example app here: https://github.com/vtex/payment-example-app

## Development

Execute any make command on the terminal of your machine (normally works on Linux and Mac).

This is a React Native example App, Makefile have helpers on how to setup and test (as you can see below). But you can also see React Native's documentation if you have any doubts on how to run it: https://facebook.github.io/react-native/docs/getting-started.html (the "Building Projects with Native Code" can be a good place to start)

### Setup project

`make setup` (need node and npm installed on your machine)

### Run on iOS simulator

`make run` (or `make ios`)

### Run on iOS device

See [Running on Device](http://facebook.github.io/react-native/docs/running-on-device.html)

### Run on Android emulator / device via command line

`make android`

### Run on Android emulator / device via Android Studio

`make setup` (if not already executed, remember: need node and npm installed on your machine)

`make server` (it starts react native packager to bundle javascript)

Open directory `vtex-payment-test/android` on Android Studio.

Run as a normal Android app.

Dismiss any initial red error (like bridge error or could not connect to local server), after the app initialize.

Shake the device to open developer options.
Choose Dev Settings, then choose "Debug server host & port for device".
Then insert the IP Address of the machine that you executed the `make server` command with the port 8081, example: `10.1.12.4:8081`

If you want to make changes to javascript to change parameters on links, you can edit App.js file and then shake the device again and press "Reload".
