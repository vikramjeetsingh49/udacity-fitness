import React from 'react';
import { View, StyleSheet } from 'react-native';
import { connect } from 'react-redux';
import { white } from '../utils/colors';
import MetricCard from './MetricCard';
import { addEntry } from '../actions';
import { removeEntry } from '../utils/api';
import { timeToString, getDailyReminderValue } from '../utils/helpers';
import TextButton from './TextButton';

const EntryDetail = ({ navigation, entryId, metrics, remove, goBack }) => {
  const [year, month, day] = entryId.split('-');
  const title = `${month}/${day}/${year}`;

  navigation.setOptions({ title });

  const reset = () => {
    remove();
    goBack();
    removeEntry(entryId);
  };

  return (
    metrics &&
    !metrics.today && (
      <View style={styles.container}>
        <MetricCard metrics={metrics} />
        <TextButton onPress={reset} style={{ margin: 10 }}>
          RESET
        </TextButton>
      </View>
    )
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: white,
    padding: 15,
  },
});

const mapStateToProps = (state, props) => {
  const { entryId } = props.route.params;

  return { entryId, metrics: state[entryId] };
};

const mapDispatchToProps = (dispatch, props) => {
  const { entryId } = props.route.params;
  console.log('entryId :>> ', entryId);

  return {
    remove: () =>
      dispatch(
        addEntry({
          [entryId]:
            timeToString() === entryId ? getDailyReminderValue() : null,
        })
      ),
    goBack: () => props.navigation.goBack(),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(EntryDetail);
