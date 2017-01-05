import React, { Component } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Text,
  Linking,
} from 'react-native';

const styles = StyleSheet.create({
  button: {
    padding: 10,
    backgroundColor: '#3B5998',
    marginBottom: 10,
  },
  text: {
    color: 'white',
  },
});

export default class OpenURLButton extends Component {
  static propTypes = {
    url: React.PropTypes.string,
  };

  constructor(props) {
    super(props);
    console.log('url', props.url);
  }

  handleClick = () => {
    Linking.openURL(this.props.url);
    // Linking.canOpenURL(this.props.url).then(supported => {
    //   if (supported) {
    //     Linking.openURL(this.props.url);
    //   } else {
    //     console.log('Don\'t know how to open URI: ' + this.props.url);
    //   }
    // });
  };

  render() {
    return (
      <TouchableOpacity
        onPress={this.handleClick}>
        <View style={styles.button}>
          <Text style={styles.text}>Open {this.props.url}</Text>
        </View>
      </TouchableOpacity>
    );
  }
}
