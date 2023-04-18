/** @format */

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
  onLongPressOut: () => void
  panHandlers: GestureResponderHandlers
  delayLongPress: number
  children?: React.ReactNode
}

export const Block: FunctionComponent<BlockProps> = ({
  style,
  dragStartAnimationStyle,
  onPress,
  onLongPress,
  onLongPressOut,
  children,
  panHandlers,
  delayLongPress
}) => {
  return (
    <Animated.View style={[styles.blockContainer, style, dragStartAnimationStyle]} {...panHandlers}>
      <Animated.View>
        <TouchableWithoutFeedback delayLongPress={delayLongPress} delayPressOut={100} onPress={onPress} onLongPress={onLongPress} onPressOut={onLongPressOut}>
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
