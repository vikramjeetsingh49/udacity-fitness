import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Foundation } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';

import { calculateDirection, PERMISSION_STATUS } from '../utils/helpers';
import { purple, white } from '../utils/colors';

const INITIAL_BOUNCE_VALUE = new Animated.Value(1);

const Live = () => {
  const [direction, setDirection] = useState('');
  const [coordinates, setCoordinates] = useState({});
  const [status, setStatus] = useState(PERMISSION_STATUS.INITIAL_STATUS);

  const [bounceValue, setBounceValue] = useState(INITIAL_BOUNCE_VALUE);

  useEffect(() => {
    Permissions.getAsync(Permissions.LOCATION)
      .then(({ status }) =>
        status === PERMISSION_STATUS.GRANTED ? setLocation() : setStatus(status)
      )
      .catch((err) => {
        console.error('Error getting location permissions', { err });
        setStatus(PERMISSION_STATUS.UNDETERMINED);
      });
  }, [setLocation]);

  const askPermission = () => {
    Permissions.askAsync(Permissions.LOCATION)
      .then(({ status }) =>
        status === PERMISSION_STATUS.GRANTED ? setLocation() : setStatus(status)
      )
      .catch((err) => {
        console.error('Error while asking location permissions', { err });
        setStatus(PERMISSION_STATUS.UNDETERMINED);
      });
  };

  const setLocation = () => {
    Location.watchPositionAsync(
      {
        timeInterval: 1,
        distanceInterval: 1,
      },
      ({ coords }) => {
        const newDirection = calculateDirection(coords.heading);

        if (newDirection !== direction) {
          Animated.sequence([
            Animated.timing(bounceValue, { duration: 200, toValue: 1.04 }),
            Animated.spring(bounceValue, { toValue: 1, friction: 4 }),
          ]).start();
        }

        setDirection(newDirection);
        setCoordinates(coords);
        setStatus(PERMISSION_STATUS.GRANTED);
      }
    );
  };

  switch (status) {
    case PERMISSION_STATUS.INITIAL_STATUS:
      return <ActivityIndicator style={{ marginTop: 30 }} />;
    case PERMISSION_STATUS.DENIED:
      return (
        <View style={styles.center}>
          <Foundation name="alert" size={50} />
          <Text>
            You denied your location. You can fix this by visiting your settings
            and enabling location services for this app.
          </Text>
        </View>
      );
    case PERMISSION_STATUS.UNDETERMINED:
      return (
        <View style={styles.center}>
          <Foundation name="alert" size={50} />
          <Text>You need to enable location services for this app.</Text>
          <TouchableOpacity onPress={askPermission} style={styles.button}>
            <Text style={styles.buttonText}>Enable</Text>
          </TouchableOpacity>
        </View>
      );
    default:
      return (
        <View style={styles.container}>
          <View style={styles.directionContainer}>
            <Text style={styles.header}>You're heading</Text>
            <Animated.Text
              style={[
                styles.direction,
                { transform: [{ scale: bounceValue }] },
              ]}
            >
              {direction}
            </Animated.Text>
          </View>
          <View style={styles.metricContainer}>
            <View style={styles.metric}>
              <Text style={[styles.header, { color: white }]}>Altitude</Text>
              <Text style={[styles.subHeader, { color: white }]}>
                {Math.round(coordinates.altitude * 3.2808)} Feet
              </Text>
            </View>
            <View style={styles.metric}>
              <Text style={[styles.header, { color: white }]}>Speed</Text>
              <Text style={[styles.subHeader, { color: white }]}>
                {Math.round(coordinates.speed * 2.2369).toFixed(1)} MPH
              </Text>
            </View>
          </View>
        </View>
      );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 30,
    marginRight: 30,
  },
  button: {
    padding: 10,
    backgroundColor: purple,
    alignSelf: 'center',
    borderRadius: 5,
    margin: 20,
  },
  buttonText: {
    color: white,
    fontSize: 20,
  },
  directionContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    fontSize: 35,
    textAlign: 'center',
  },
  direction: {
    color: purple,
    fontSize: 120,
    textAlign: 'center',
  },
  metricContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: purple,
  },
  metric: {
    flex: 1,
    paddingTop: 15,
    paddingBottom: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginTop: 20,
    marginBottom: 20,
    marginLeft: 10,
    marginRight: 10,
  },
  subHeader: {
    fontSize: 25,
    textAlign: 'center',
    marginTop: 5,
  },
});

export default Live;
