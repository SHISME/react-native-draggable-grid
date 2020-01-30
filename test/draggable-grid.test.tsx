import * as React from 'react';
import { DraggableGrid } from '../src/draggable-grid';
import { create } from 'react-test-renderer';
import { View, Text } from 'react-native';

describe('draggable-grid', () => {
  const data = [
    {name:'1',key:'one'},
    {name:'2',key:'two'},
    {name:'3',key:'three'},
    {name:'4',key:'four'},
    {name:'5',key:'five', disabledDrag:true, disabledSorted: true},
    {name:'6',key:'six'},
    {name:'7',key:'seven'},
    {name:'8',key:'eight'},
  ];
  const data2 = [
    ...data,
    {
      name: '9',
      key: 'night'
    }
  ]
  const draggableGridRender = create(
    <DraggableGrid
      data={data}
      numColumns={3}
      renderItem={() => {
        return <View><Text>1111</Text></View>}
      }/>
  );
  const draggableInstance = (draggableGridRender.getInstance()) as any;
  it('items 初始化正确', () => {
    expect(draggableInstance.items.length).toBe(data.length);
  })
  it ('新增', () => {
    draggableGridRender.update(
      <DraggableGrid
        data={data2}
        numColumns={3}
        renderItem={() => {
          return <View><Text>1111</Text></View>}
        }/>
    );
    expect(draggableInstance.items.length).toBe(data2.length);
  })
})