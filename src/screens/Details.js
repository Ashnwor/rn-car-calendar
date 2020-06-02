import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { TextInput, FAB, List as ListItem, Text } from 'react-native-paper';
import { Button, Paragraph, Dialog, Portal } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import theme from '../theme';
import { storeDates, addDate } from '../thunks';
import { storeData, getData } from '../utils';

function Details({ route, navigation }) {
	const day = route.params;
	navigation.setOptions({
		headerStyle: {
			backgroundColor: theme.colors.primary,
		},
		headerTintColor: theme.colors.headerText,
	});

	const [retrievalDate, setRetrievalDate] = useState(new Date());
	const [show, setShow] = useState(false);
	const [visible, setVisible] = useState(false);

	const [licensePlate, setLicensePlate] = useState('');
	const [brand, setBrand] = useState('');
	const [model, setModel] = useState('');

	const dateToString = (date) => {
		let day;
		let month;
		let year = date.getFullYear();
		date.getDate().toString().length === 1
			? (day = '0' + date.getDate().toString())
			: (day = date.getDate().toString());
		date.getMonth().toString().length === 1
			? (month = '0' + (date.getMonth() + 1).toString())
			: (month = (date.getMonth() + 1).toString());
		return {
			normal: `${day}-${month}-${year}`,
			reverse: `${year}-${month}-${day}`,
			unprocessed: date,
		};
	};

	const onChange = (event, selectedDate) => {
		const currentDate = selectedDate || retrievalDate;
		setShow(Platform.OS === 'ios');
		setRetrievalDate(currentDate);
	};

	const showDatepicker = () => {
		setShow(true);
	};

	const [dates, setDates] = useState({});

	useFocusEffect(
		useCallback(() => {
			console.log('Details');
			let result;
			getData('storage').then((value) => {
				result = value;
				setDates(result);
				console.log('result: ', result);
			});
			// dispatch(fetchDates());
			// dispatch(cleanDates());
			// dispatch(storeDates({}));
		}, [])
	);

	const save = () => {
		console.log('TESTING');
		const combinedRetrievalDate = dateToString(retrievalDate);
		if (licensePlate && brand && model) {
			if (dates[day.dateString]) {
				dates[day.dateString][licensePlate] = {
					brand,
					model,
					combinedRetrievalDate,
				};
			} else {
				dates[day.dateString] = {};
				dates[day.dateString][licensePlate] = {
					brand,
					model,
					combinedRetrievalDate,
				};
			}
		} else {
			setVisible(true);
		}

		console.log(dates);
		storeData('storage', dates).then(() => {
			getData('storage').then((data) => console.log('data:', data));
		});
	};

	return (
		<View style={styles.container}>
			<TextInput
				style={styles.input}
				label="Plaka"
				value={licensePlate}
				onChangeText={(text) => setLicensePlate(text)}
				// defaultValue={licensePlate}
			/>
			<TextInput
				style={styles.input}
				label="Marka"
				value={brand}
				onChangeText={(text) => setBrand(text)}
				// defaultValue={brand}
			/>
			<TextInput
				style={styles.input}
				label="Model"
				value={model}
				onChangeText={(text) => setModel(text)}
				// defaultValue={model}
			/>
			<ListItem.Item
				style={styles.input}
				title="Alım Tarihi"
				description={dateToString(retrievalDate).normal}
				left={(props) => <ListItem.Icon {...props} icon="calendar" />}
				onPress={() => showDatepicker()}
			/>

			{show && (
				<DateTimePicker
					testID="dateTimePicker"
					timeZoneOffsetInMinutes={0}
					value={retrievalDate}
					mode={'date'}
					is24Hour={true}
					display="default"
					onChange={onChange}
					maximumDate={new Date()}
				/>
			)}

			<Portal>
				<Dialog visible={visible} onDismiss={() => setVisible(false)}>
					<Dialog.Title>Uyarı</Dialog.Title>
					<Dialog.Content>
						{!licensePlate ? <Text>Plaka bilgisi girilmemiş</Text> : null}
						{!brand ? <Text>Marka bilgisi girilmemiş</Text> : null}
						{!model ? <Text>Model bilgisi girilmemiş</Text> : null}
					</Dialog.Content>
					<Dialog.Actions>
						<Button onPress={() => setVisible(false)}>Done</Button>
					</Dialog.Actions>
				</Dialog>
			</Portal>
			<FAB
				style={styles.fab}
				icon="content-save"
				label="Kaydet"
				onPress={() => save()}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
	},

	input: { margin: 5 },

	saveBtn: {
		width: '30%',
		alignSelf: 'center',
		marginTop: 50,
	},

	fab: {
		position: 'absolute',
		margin: 16,
		right: 0,
		bottom: 0,
	},
});

export default Details;
