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
  }

  _handleOpenUrl(url) {
    if (url) {
      console.log('URL is: ' + url);
      this.setState({ url });
    }
  }

  componentDidMount() {
    const url = Linking.getInitialURL().then(this._handleOpenUrl)
      .catch(err => console.error('An error occurred', err));
    console.log('addEventListener url', url);
    Linking.addEventListener('url', this._handleOpenURL);
  }

  componentWillUnmount() {
    console.log('removeEventListener url', url);
    Linking.removeEventListener('url', this._handleOpenURL);
  }

  render() {
    const platform = Platform.OS;
    const url = (this.state.url) ? this.state.url : "NENHUMA";

    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          URL: {url}
        </Text>
        <Text style={styles.instructions}>
          To get started, edit index.{platform}.js
        </Text>
        <OpenURLButton url="https://www.facebook.com/" />
        <OpenURLButton url="instore://back/" />
        <OpenURLButton url="sitef://recursion/" />
        <Text style={styles.instructions}>
          Double tap R on your keyboard to reload,{'\n'}
          Shake or press menu button for dev menu
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
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
