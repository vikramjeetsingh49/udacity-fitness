import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { connect } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { CommonActions } from '@react-navigation/native';

import CustomSlider from './CustomSlider';
import Stepper from './Stepper';
import DateHeader from './DateHeader';
import TextButton from './TextButton';

import {
  getMetricMetaInfo,
  timeToString,
  getDailyReminderValue,
  clearLocalNotification,
  setLocalNotification,
} from '../utils/helpers';
import { submitEntry, removeEntry } from '../utils/api';
import { addEntry } from '../actions';
import { white, purple } from '../utils/colors';

const INITIAL_STATE = {
  run: 0,
  bike: 0,
  swim: 0,
  sleep: 0,
  eat: 0,
};

const SubmitButton = ({ onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={Platform.OS === 'ios' ? styles.iosSubmit : styles.androidSubmit}
    >
      <Text style={styles.submitBtnText}>Submit</Text>
    </TouchableOpacity>
  );
};

const AddEntry = ({ dispatch, alreadyLogged, navigation }) => {
  const [state, setState] = useState(INITIAL_STATE);

  const getState = (metric) => {
    return state[metric];
  };

  const increment = (metric) => {
    const { max, step } = getMetricMetaInfo(metric);
    const count = +state[metric] + step;
    setState({ ...state, [metric]: count > max ? max : count });
  };

  const decrement = (metric) => {
    const { step } = getMetricMetaInfo(metric);
    const count = +state[metric] - step;

    setState({ ...state, [metric]: count < 0 ? 0 : count });
  };

  const slide = (metric, value) => {
    setState({ ...state, [metric]: value });
  };

  const submit = () => {
    const key = timeToString();
    const entry = { ...state };

    dispatch(addEntry({ [key]: entry }));
    setState(INITIAL_STATE);
    toHome();
    submitEntry({ entry, key });
    clearLocalNotification().then(setLocalNotification);
  };

  const reset = () => {
    const key = timeToString();
    dispatch(
      addEntry({
        [key]: getDailyReminderValue(),
      })
    );
    toHome();
    removeEntry(key);
  };

  const toHome = () => navigation.dispatch(CommonActions.goBack());

  const metaInfo = getMetricMetaInfo();

  return alreadyLogged ? (
    <View style={styles.center}>
      <Ionicons name="md-happy" size={100} />
      <Text>You already logged your information for today</Text>
      <TextButton onPress={reset}>Reset</TextButton>
    </View>
  ) : (
    <View style={styles.container}>
      <DateHeader date={new Date().toLocaleDateString()} />
      {Object.keys(metaInfo).map((key) => {
        const { getIcon, type, ...others } = metaInfo[key];
        const value = getState(key);

        return (
          <View key={key} style={styles.row}>
            {getIcon()}
            {type === 'slider' ? (
              <CustomSlider
                value={value}
                onChange={(v) => slide(key, v)}
                {...others}
              />
            ) : (
              <Stepper
                value={value}
                onIncrement={() => increment(key)}
                onDecrement={() => decrement(key)}
                {...others}
              />
            )}
          </View>
        );
      })}
      <SubmitButton onPress={submit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: white,
  },
  row: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 30,
    marginRight: 30,
  },
  iosSubmit: {
    backgroundColor: purple,
    padding: 10,
    borderRadius: 7,
    height: 45,
    marginLeft: 40,
    marginRight: 40,
  },
  androidSubmit: {
    backgroundColor: purple,
    padding: 10,
    paddingLeft: 30,
    paddingRight: 30,
    borderRadius: 2,
    height: 45,
    alignSelf: 'flex-end',
    justifyContent: 'center',
  },
  submitBtnText: {
    color: white,
    fontSize: 22,
    textAlign: 'center',
  },
});

const mapStateToProps = (state) => {
  const key = timeToString();

  return {
    alreadyLogged: state[key] && !state[key].today,
  };
};

export default connect(mapStateToProps)(AddEntry);
