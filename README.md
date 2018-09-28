# Demo

<p align="center">
  <img alt="Issue Stats" width="400" src="https://github.com/SHISME/react-native-draggable-grid/blob/master/example.gif?raw=true">
</p>


# react-native-draggable-grid

# Getting Started

## Installation

```bash
npm install react-native-draggable-grid --save
```

## Usage

```javascript

import React from 'react';
import {
  View,
  StyleSheet,
  Text,
} from 'react-native';
import { DraggableGrid } from '../DraggableGrid';

interface MyTestProps {

}

interface MyTestState {
  data:{key:string, name:string}[];
}

export class MyTest extends React.Component<MyTestProps, MyTestState>{

  constructor(props:MyTestProps) {
    super(props);
    this.state = {
      data:[
        {name:'1',key:'one'},
        {name:'2',key:'two'},
        {name:'3',key:'three'},
        {name:'4',key:'four'},
        {name:'5',key:'five'},
        {name:'6',key:'six'},
        {name:'7',key:'seven'},
        {name:'8',key:'eight'},
        {name:'9',key:'night'},
        {name:'0',key:'zero'},
      ],
    };
  }

  public render_item(item:{name:string, key:string}) {
    return (
      <View
        style={styles.item}
        key={item.key}
      >
        <Text style={styles.item_text}>{item.name}</Text>
      </View>
    );
  }

  render() {
    return (
      <View style={styles.wrapper}>
        <DraggableGrid
          numColumns={4}
          renderItem={this.render_item}
          data={this.state.data}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  button:{
    width:150,
    height:100,
    backgroundColor:'blue',
  },
  wrapper:{
    paddingTop:100,
    width:'100%',
    height:'100%',
    justifyContent:'center',
  },
  item:{
    width:100,
    height:100,
    borderRadius:8,
    backgroundColor:'red',
    justifyContent:'center',
    alignItems:'center',
  },
  item_text:{
    fontSize:40,
    color:'#FFFFFF',
  },
});


```

# Props

