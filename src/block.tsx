import * as React from 'react';
import {
  Animated,
  StyleProp,
  TouchableWithoutFeedback,
  StyleSheet,
  GestureResponderHandlers,
} from 'react-native';

interface BlockProps {
  style?: StyleProp<any>;
  dragStartAnimationStyle:StyleProp<any>;
  onPress?: () => void;
  onLongPress: () => void;
  panHandlers:GestureResponderHandlers;
}


export class Block extends React.Component<BlockProps>{
  public render() {
    return (
      <Animated.View
        style={[styles.blockContainer, this.props.style]}
        {...this.props.panHandlers}
      >
        <Animated.View
          style={this.props.dragStartAnimationStyle}
        >
          <TouchableWithoutFeedback
            onPress={this.props.onPress}
            onLongPress={this.props.onLongPress}
          >
            {this.props.children}
          </TouchableWithoutFeedback>
        </Animated.View>
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  blockContainer:{
    alignItems:'center',
  },
});