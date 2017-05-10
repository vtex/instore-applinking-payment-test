/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  Platform,
  Linking,
  StyleSheet,
  ScrollView,
  Text,
  View
} from 'react-native';

import OpenURLButton from './OpenURLButton';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      url: null,
    };
    this._handleOpenUrl = this._handleOpenUrl.bind(this);
    this._handleInitialUrl = this._handleInitialUrl.bind(this);
  }

  _handleOpenUrl(event) {
    if (event && event.url) {
      console.log('URL is: ' + event.url);
      this.setState({ url: event.url });
    }
  }

  _handleInitialUrl(url) {
    if (url) {
      console.log('URL is: ' + url);
      this.setState({ url });
    }
  }

  componentDidMount() {
    Linking.getInitialURL().then(this._handleInitialUrl)
      .catch(err => console.error('An error occurred', err));
    console.log('addEventListener url');
    Linking.addEventListener('url', this._handleOpenUrl);
  }

  componentWillUnmount() {
    console.log('removeEventListener url');
    Linking.removeEventListener('url', this._handleOpenUrl);
  }

  getPaymentUrl(acquirerProtocol, acquirerId) {
    let url = `${acquirerProtocol}://payment/?acquirerId=${acquirerId}`;

    url += '&' + [
      "action=payment",
      "amount=200",
      "installments=2",
      "transactionId=10010",
      "paymentId=1093019888",
      "installments=2",
      "paymentType=credit",
      "autoConfirm=true",
      "scheme=vtex-payment-test"
    ].join('&');

    return url;
  }

  getRefundUrl(acquirerProtocol, acquirerId, paymentId, acquirerAuthorizationCode) {
    let url = `${acquirerProtocol}://payment-reversal/?acquirerId=${acquirerId}`;

    url += '&' + [
      "transactionId=10010",
      `paymentId=${paymentId}`,
      `acquirerAuthorizationCode=${acquirerAuthorizationCode}`,
      "scheme=vtex-payment-test"
    ].join('&');

    return url;
  }

  render() {
    const platform = Platform.OS;
    const url = (this.state.url) ? this.state.url : "NENHUMA";

    const paymentUrl = this.getPaymentUrl('stone', '954090369');
    const paymentRefund = this.getRefundUrl('stone', '954090369', '200', '100');

    const infoView = (
      <View>
        <Text style={styles.welcome}>
          URL: {url}
        </Text>
        <Text style={styles.instructions}>
          Edit App.js if you want to change parameters
        </Text>
        <OpenURLButton url="instore://payment/" />
        <OpenURLButton url="vtex-payment-test://payment/" />
        <OpenURLButton url={paymentUrl} />
        <OpenURLButton url={paymentRefund} />
        <Text style={styles.instructions}>
          Shake or press menu button for dev menu
        </Text>
      </View>
    );

    return (
      <View style={styles.container}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContentContainer}>
          {infoView}
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContentContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginTop: 5,
    marginBottom: 10,
  },
});
