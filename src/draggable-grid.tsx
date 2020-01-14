import * as React from 'react'
import {
  PanResponderInstance,
  PanResponder,
  Animated,
  StyleSheet,
  StyleProp,
  GestureResponderEvent,
  PanResponderGestureState,
  ViewStyle,
} from 'react-native'
import { Block } from './block'
import { findKey, findIndex, differenceBy } from './utils'

export interface IOnLayoutEvent {
  nativeEvent: { layout: { x: number; y: number; width: number; height: number } }
}

interface IBaseItemType {
  key: string
  disabledDrag?: boolean;
  disabledReSorted?: boolean;
}

export interface IDraggableGridProps<DataType extends IBaseItemType> {
  numColumns: number
  data: DataType[]
  renderItem: (item: DataType, order: number) => React.ReactElement<any>
  style?: ViewStyle
  itemHeight?: number
  dragStartAnimation?: StyleProp<any>
  onItemPress?: (item: DataType) => void
  onDragStart?: (item: DataType) => void
  onDragRelease?: (newSortedData: DataType[]) => void
  onResetSort?: (newSortedData: DataType[]) => void
}
export interface IDraggableGridState {
  blockHeight: number
  blockWidth: number
  gridHeight: Animated.Value
  activeItemIndex?: number
  gridLayout: { x: number; y: number; width: number; height: number }
  hadInitBlockSize: boolean
  dragStartAnimatedValue: Animated.Value
}
interface IPositionOffset {
  x: number
  y: number
}
interface IOrderMapItem {
  order: number
}
interface IItem<DataType> {
  key: string
  itemData: DataType
  currentPosition: Animated.AnimatedValueXY
}
export class DraggableGrid<DataType extends IBaseItemType> extends React.Component<
  IDraggableGridProps<DataType>,
  IDraggableGridState
> {
  private panResponder: PanResponderInstance
  private panResponderCapture: boolean
  private orderMap: {
    [itemKey: string]: IOrderMapItem
  } = {}
  private items: IItem<DataType>[] = []
  private itemMap: {
    [itemKey: string]: DataType
  } = {}
  private blockPositions: IPositionOffset[] = []
  private activeBlockOffset: IPositionOffset = { x: 0, y: 0 }

  public constructor(props: IDraggableGridProps<DataType>) {
    super(props)
    this.panResponderCapture = false
    this.panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: () => this.panResponderCapture,
      onMoveShouldSetPanResponderCapture: () => this.panResponderCapture,
      onShouldBlockNativeResponder: () => false,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: this.onStartDrag.bind(this),
      onPanResponderMove: this.onHandMove.bind(this),
      onPanResponderRelease: this.onHandRelease.bind(this),
    })
    this.state = {
      blockHeight: 0,
      blockWidth: 0,
      gridHeight: new Animated.Value(0),
      hadInitBlockSize: false,
      dragStartAnimatedValue: new Animated.Value(1),
      gridLayout: {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      },
    }
  }

  private resetGridHeight = () => {
    const { props } = this
    const rowCount = Math.ceil(props.data.length / props.numColumns)
    this.state.gridHeight.setValue(rowCount * this.state.blockHeight)
  }

  public componentWillReceiveProps(nextProps: IDraggableGridProps<DataType>) {
    nextProps.data.forEach((item, index) => {
      if (this.orderMap[item.key]) {
        if (this.orderMap[item.key].order != index) {
          this.orderMap[item.key].order = index
          this.moveBlockToBlockOrderPosition(item.key)
        }
        const currentItem = this.items.find(i => i.key === item.key)
        if (currentItem) {
          currentItem.itemData = item
        }
        this.itemMap[item.key] = item
      } else {
        this.addItem(item, index)
      }
    })
    const deleteItems = differenceBy(this.items, nextProps.data, 'key')
    deleteItems.forEach(item => {
      this.removeItem(item)
    })
  }

  public componentDidUpdate() {
    this.resetGridHeight()
  }

  private addItem = (item: DataType, index: number) => {
    this.blockPositions.push(this.getBlockPositionByOrder(this.items.length))
    this.orderMap[item.key] = {
      order: index,
    }
    this.itemMap[item.key] = item
    this.items.push({
      key: item.key,
      itemData: item,
      currentPosition: new Animated.ValueXY(this.getBlockPositionByOrder(index)),
    })
  }

  private removeItem = (item: IItem<DataType>) => {
    const itemIndex = findIndex(this.items, curItem => curItem.key === item.key)
    this.items.splice(itemIndex, 1)
    this.blockPositions.pop()
    delete this.orderMap[item.key]
  }

  public componentWillMount() {
    this.items = this.props.data.map((item, index) => {
      this.orderMap[item.key] = {
        order: index,
      }
      this.itemMap[item.key] = item
      return {
        key: item.key,
        itemData: item,
        currentPosition: new Animated.ValueXY(),
      }
    })
  }

  public render() {
    return (
      <Animated.View
        style={[
          styles.draggableGrid,
          this.props.style,
          {
            height: this.state.gridHeight,
          },
        ]}
        onLayout={this.assessGridSize}>
        {this.state.hadInitBlockSize &&
          this.items.map((item, itemIndex) => {
            return (
              <Block
                onPress={this.onBlockPress.bind(this, itemIndex)}
                onLongPress={this.setActiveBlock.bind(this, itemIndex, item.itemData)}
                panHandlers={this.panResponder.panHandlers}
                style={this.getBlockStyle(itemIndex)}
                dragStartAnimationStyle={this.getDragStartAnimation(itemIndex)}
                key={item.key}>
                {this.props.renderItem(item.itemData, this.orderMap[item.key].order)}
              </Block>
            )
          })}
      </Animated.View>
    )
  }

  private onBlockPress(itemIndex: number) {
    this.props.onItemPress && this.props.onItemPress(this.items[itemIndex].itemData)
  }

  private getBlockStyle = (itemIndex: number) => {
    return [
      {
        justifyContent: 'center',
        alignItems: 'center',
      },
      this.state.hadInitBlockSize && {
        width: this.state.blockWidth,
        height: this.state.blockHeight,
        position: 'absolute',
        top: this.items[itemIndex].currentPosition.getLayout().top,
        left: this.items[itemIndex].currentPosition.getLayout().left,
      },
    ]
  }
  
  private setActiveBlock = (itemIndex: number, item: DataType) => {
    if (item.disabledDrag) return
    
    this.panResponderCapture = true
    this.setState(
      {
        activeItemIndex: itemIndex,
      },
      () => {
        this.startDragStartAnimation()
      },
    )
  }

  private getDragStartAnimation = (itemIndex: number) => {
    if (this.state.activeItemIndex != itemIndex) {
      return
    }

    let dragStartAnimation
    if (this.props.dragStartAnimation) {
      dragStartAnimation = this.props.dragStartAnimation
    } else {
      dragStartAnimation = this.getDefaultDragStartAnimation()
    }
    return {
      zIndex: 3,
      ...dragStartAnimation,
    }
  }

  private getDefaultDragStartAnimation = () => {
    return {
      transform: [
        {
          scale: this.state.dragStartAnimatedValue,
        },
      ],
      shadowColor: '#000000',
      shadowOpacity: 0.2,
      shadowRadius: 6,
      shadowOffset: {
        width: 1,
        height: 1,
      },
    }
  }

  private startDragStartAnimation = () => {
    if (!this.props.dragStartAnimation) {
      this.state.dragStartAnimatedValue.setValue(1)
      Animated.timing(this.state.dragStartAnimatedValue, {
        toValue: 1.1,
        duration: 100,
      }).start()
    }
  }

  private getBlockPositionByOrder = (order: number) => {
    if (this.blockPositions[order]) {
      return this.blockPositions[order]
    }
    const { blockWidth, blockHeight } = this.state
    const columnOnRow = order % this.props.numColumns
    const y = blockHeight * Math.floor(order / this.props.numColumns)
    const x = columnOnRow * blockWidth
    return {
      x,
      y,
    }
  }

  private assessGridSize = (event: IOnLayoutEvent) => {
    if (!this.state.hadInitBlockSize) {
      let blockWidth, blockHeight
      blockWidth = event.nativeEvent.layout.width / this.props.numColumns
      blockHeight = this.props.itemHeight || blockWidth
      this.setState(
        {
          blockWidth,
          blockHeight,
          gridLayout: event.nativeEvent.layout,
        },
        () => {
          this.initBlockPositions()
          this.resetGridHeight()
        },
      )
    }
  }

  private initBlockPositions = () => {
    this.items.forEach((item, index) => {
      this.blockPositions[index] = this.getBlockPositionByOrder(index)
    })
    this.items.forEach(item => {
      item.currentPosition.setOffset(this.blockPositions[this.orderMap[item.key].order])
    })
    this.setState({ hadInitBlockSize: true })
  }

  private getActiveItem = () => {
    if (this.state.activeItemIndex === undefined) return false
    return this.items[this.state.activeItemIndex]
  }

  private getDistance = (startOffset: IPositionOffset, endOffset: IPositionOffset) => {
    const xDistance = startOffset.x + this.activeBlockOffset.x - endOffset.x
    const yDistance = startOffset.y + this.activeBlockOffset.y - endOffset.y
    return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2))
  }

  private onStartDrag(nativeEvent: GestureResponderEvent, gestureState: PanResponderGestureState) {
    const activeItem = this.getActiveItem()
    if (!activeItem) return false
    this.props.onDragStart && this.props.onDragStart(activeItem.itemData)
    const { x0, y0, moveX, moveY } = gestureState
    const activeOrigin = this.blockPositions[this.orderMap[activeItem.key].order]
    const x = activeOrigin.x - x0
    const y = activeOrigin.y - y0
    activeItem.currentPosition.setOffset({
      x,
      y,
    })
    this.activeBlockOffset = {
      x,
      y,
    }
    activeItem.currentPosition.setValue({
      x: moveX,
      y: moveY,
    })
  }

  private onHandMove(nativeEvent: GestureResponderEvent, gestureState: PanResponderGestureState) {
    const activeItem = this.getActiveItem()
    if (!activeItem) return false
    const { moveX, moveY } = gestureState

    const xChokeAmount = Math.max(
      0,
      this.activeBlockOffset.x + moveX - (this.state.gridLayout.width - this.state.blockWidth),
    )
    const xMinChokeAmount = Math.min(0, this.activeBlockOffset.x + moveX)

    const dragPosition = {
      x: moveX - xChokeAmount - xMinChokeAmount,
      y: moveY,
    }
    const originPosition = this.blockPositions[this.orderMap[activeItem.key].order]
    const dragPositionToActivePositionDistance = this.getDistance(dragPosition, originPosition)
    activeItem.currentPosition.setValue(dragPosition)

    let closetItemIndex = this.state.activeItemIndex as number
    let closetDistance = dragPositionToActivePositionDistance

    this.items.forEach((item, index) => {
      if (item.itemData.disabledReSorted) return
      if (index != this.state.activeItemIndex) {
        const dragPositionToItemPositionDistance = this.getDistance(
          dragPosition,
          this.blockPositions[this.orderMap[item.key].order],
        )
        if (
          dragPositionToItemPositionDistance < closetDistance &&
          dragPositionToItemPositionDistance < this.state.blockWidth
        ) {
          closetItemIndex = index
          closetDistance = dragPositionToItemPositionDistance
        }
      }
    })
    if (this.state.activeItemIndex != closetItemIndex) {
      const closetOrder = this.orderMap[this.items[closetItemIndex].key].order
      this.resetBlockPositionByOrder(this.orderMap[activeItem.key].order, closetOrder)
      this.orderMap[activeItem.key].order = closetOrder
      this.props.onResetSort && this.props.onResetSort(this.getSortData())
    }
  }

  private resetBlockPositionByOrder = (activeItemOrder: number, insertedPositionOrder: number) => {
    let disabledReSortedItemCount = 0
    if (activeItemOrder > insertedPositionOrder) {
      for (let i = activeItemOrder - 1; i >= insertedPositionOrder; i--) {
        const key = this.getKeyByOrder(i)
        const item = this.itemMap[key]
        if (item && item.disabledReSorted) {
          disabledReSortedItemCount ++
        } else {
          this.orderMap[key].order += disabledReSortedItemCount + 1;
          disabledReSortedItemCount = 0
          this.moveBlockToBlockOrderPosition(key)
        }
      }
    } else {
      for (let i = activeItemOrder + 1; i <= insertedPositionOrder; i++) {
        const key = this.getKeyByOrder(i)
        const item = this.itemMap[key]
        if (item && item.disabledReSorted) {
          disabledReSortedItemCount ++
        } else {
          this.orderMap[key].order -= disabledReSortedItemCount + 1
          disabledReSortedItemCount = 0
          this.moveBlockToBlockOrderPosition(key)
        }

      }
    }
  }

  private moveBlockToBlockOrderPosition = (itemKey: string) => {
    const itemIndex = findIndex(this.items, item => item.key === itemKey)
    this.items[itemIndex].currentPosition.flattenOffset()
    Animated.timing(this.items[itemIndex].currentPosition, {
      toValue: this.blockPositions[this.orderMap[itemKey].order],
      duration: 200,
    }).start()
  }

  private getKeyByOrder = (order: number) => {
    return findKey(this.orderMap, (item: IOrderMapItem) => item.order === order) as string
  }

  private getSortData = () => {
    const sortData: DataType[] = []
    this.items.forEach(item => {
      sortData[this.orderMap[item.key].order] = item.itemData
    })
    return sortData
  }

  private onHandRelease() {
    const activeItem = this.getActiveItem()
    if (!activeItem) return false
    if (this.props.onDragRelease) {
      this.props.onDragRelease(this.getSortData())
    }
    this.panResponderCapture = false
    activeItem.currentPosition.flattenOffset()
    this.moveBlockToBlockOrderPosition(activeItem.key)
    this.setState({
      activeItemIndex: undefined,
    })
  }
}

const styles = StyleSheet.create({
  draggableGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
})
