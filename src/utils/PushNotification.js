import messaging from '@react-native-firebase/messaging';
import { getStringByKey, storeStringByKey } from './Storage';
import { POSTNETWORK } from './Network';
import { BASE_URL } from '../constant/url';
import { Vibration } from 'react-native';

export const requestUserPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    if (enabled) {
        console.log('Authorization status:', authStatus);
        getFCM();
    }
}
const postFcmdetails = async () => {

    const url =`${BASE_URL}enterFCMTokenDetails?_format=json`
    const user= await getStringByKey('fcmtoken')
    console.log('tokennnnnnnnn',user)
    const obj={
        "token":user
    }
    // console.log("obj",obj)


    POSTNETWORK(url,obj).then(res=>{
        console.log("responseeeeeee",res)
        // console.log("response",res)
    })
}

const getFCM = async () => {
    const fcmtoken = await getStringByKey('fcmtoken');
    if (fcmtoken) {
        console.log('old fcmtoken', fcmtoken);
    } else {
        try {
            const fcmtoken = await messaging().getToken();
            storeStringByKey('fcmtoken', fcmtoken);
            console.log('new fcmtokennnnnnnn', fcmtoken);
            postFcmdetails()
        } catch (err) {
            console.log("err", err);
        }
    }

}

export const NotificationListener = () => {
    console.log("first")
    messaging().onNotificationOpenedApp(remoteMessage => {
        console.log(
            'Notification caused app to open from background state:',
            remoteMessage.notification,
        );
    });


    messaging()
    .getInitialNotification()
    .then(remoteMessage => {
        // Vibration.vibrate();
        if (remoteMessage) {
            console.log(
                'Notification caused app to open from quit state:',
                remoteMessage.notification,
            );
        }
    });

    messaging().onMessage(async remoteMessage=>{
        // Vibration.vibrate();
        console.log('Notification caused app to open from forground state:',remoteMessage);
    })

    messaging().setBackgroundMessageHandler(async remoteMessage => {
        // Vibration.vibrate();
        console.log('Message handled in the background!', remoteMessage);
      });
}