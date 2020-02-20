import * as React from 'react'
import {
  Animated,
  StyleProp,
  TouchableWithoutFeedback,
  StyleSheet,
  GestureResponderHandlers,
} from 'react-native'
import { FunctionComponent } from 'react'

interface BlockProps {
  style?: StyleProp<any>
  dragStartAnimationStyle: StyleProp<any>
  onPress?: () => void
  onLongPress: () => void
  panHandlers: GestureResponderHandlers
}

export class Block extends React.Component<BlockProps> {
  public render() {
    return (
      <Animated.View
        style={[styles.blockContainer, this.props.style, this.props.dragStartAnimationStyle]}
        {...this.props.panHandlers}>
        <Animated.View>
          <TouchableWithoutFeedback
            onPress={this.props.onPress}
            onLongPress={this.props.onLongPress}>
            {this.props.children}
          </TouchableWithoutFeedback>
        </Animated.View>
      </Animated.View>
    )
  }
}

export const Block2: FunctionComponent<BlockProps> = ({
  style, dragStartAnimationStyle, onPress, onLongPress, children, panHandlers }) => {
  return (
    <Animated.View
      style={[styles.blockContainer, style, dragStartAnimationStyle]}
      {...panHandlers}>
      <Animated.View>
        <TouchableWithoutFeedback
          onPress={onPress}
          onLongPress={onLongPress}>
          {children}
        </TouchableWithoutFeedback>
      </Animated.View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  blockContainer: {
    alignItems: 'center',
  },
})
