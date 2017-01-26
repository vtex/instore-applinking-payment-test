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

  render() {
    const platform = Platform.OS;
    const url = (this.state.url) ? this.state.url : "NENHUMA";

    const infoView = (
      <View>
        <Text style={styles.welcome}>
          URL: {url}
        </Text>
        <Text style={styles.instructions}>
          To get started, edit index.{platform}.js
        </Text>
        <OpenURLButton url="https://www.facebook.com/" />
        <OpenURLButton url="instore://back/" />
        <OpenURLButton url="vtex-payment-test://home/" />
        <Text style={styles.instructions}>
          Double tap R on your keyboard to reload,{'\n'}
          Shake or press menu button for dev menu
        </Text>
      </View>
    );

    const createInfoChild = (infoChild, index) => (
      <View key={index} style={styles.infoChild}>{infoChild}</View>
    );

    const numOfChilds = 1;

    const infoViews = Array.from({length: numOfChilds}, (v, index) => createInfoChild(infoView, index));

    return (
      <View style={styles.container}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContentContainer}>
          {infoViews}
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 150,
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
  infoChild: {},
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
