import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const Header = (props) => {
  return (
    <View style={styles.header}>
      <Text style={styles.headerText}>{props.title}</Text>
    </View>
  )
}

export default Header

const styles = StyleSheet.create({
    header: {
        height: 80,
        padding: 38,
        backgroundColor: 'coral',
        marginLeft: 15,
    }, 
    headerText: {
        color: 'white',
        fontSize: 28,
        fontWeight: 'bold',
    }
})