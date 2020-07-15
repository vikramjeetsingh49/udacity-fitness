import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { purple } from '../utils/colors';

export default function ({ date }) {
  return <Text style={{ color: purple, fontSize: 25, marginTop: 25 }}>{date}</Text>;
}
