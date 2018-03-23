import React, { Component } from "react";

import { Platform } from 'react-native';

import FCM, {FCMEvent, RemoteNotificationResult, WillPresentNotificationResult, NotificationType} from "react-native-fcm";

export default class PushNotificationController extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    FCM.requestPermissions();

    FCM.getFCMToken().then(token => {
      console.log("TOKEN (getFCMToken)", token);
      // We should save this token along with userId and type of the device (in this case 'mobile') in our backend
    });

    // This is listener once notification is clicked from the tray (when the app is not running)
    // We can use this listener to start the app once notification from the tray is clicked for example
    FCM.getInitialNotification().then(notif => {
      console.log("INITIAL NOTIFICATION", notif)
    });

    // Make a listener for the new notifications
    // This listener will be triggered if the app is in the foreground 
    // If the app is in the background new notification will be received in the try and once this 
    // notification is clicked this listener will handle the notification
    // NOTE: Above listener is triggere from the notification click only if the app is not running at all 
    // (not in the foreground and not in the background)
    this.notificationListner = FCM.on(FCMEvent.Notification, notif => {
      console.log("Notification", notif);
      if(notif.local_notification){
        return;
      }
      if(notif.opened_from_tray){
        return;
      }

      if(Platform.OS ==='ios'){
              //optional
              //iOS requires developers to call completionHandler to end notification process. If you do not call it your background remote notifications could be throttled, to read more about it see the above documentation link.
              //This library handles it for you automatically with default behavior (for remote notification, finish with NoData; for WillPresent, finish depend on "show_in_foreground"). However if you want to return different result, follow the following code to override
              //notif._notificationType is available for iOS platfrom
              switch(notif._notificationType){
                case NotificationType.Remote:
                  notif.finish(RemoteNotificationResult.NewData) //other types available: RemoteNotificationResult.NewData, RemoteNotificationResult.ResultFailed
                  break;
                case NotificationType.NotificationResponse:
                  notif.finish();
                  break;
                case NotificationType.WillPresent:
                  notif.finish(WillPresentNotificationResult.All) //other types available: WillPresentNotificationResult.None
                  break;
              }
            }
      this.showLocalNotification(notif);
    });

    // Make a listener in case FCM token is refreshed
    this.refreshTokenListener = FCM.on(FCMEvent.RefreshToken, token => {
      console.log("TOKEN (refreshUnsubscribe)", token);
      // We should save this token along with userId and type of the device (in this case 'mobile') in our backend
    });
  }

  showLocalNotification(notif) {
    FCM.presentLocalNotification({
      title: notif.title,
      body: notif.body,
      priority: "high",
      click_action: notif.click_action,
      show_in_foreground: true,
      local: true,
      lights: true,
      sound: "default"
    });
  }

  componentWillUnmount() {
    this.notificationListner.remove();
    this.refreshTokenListener.remove();
  }


  render() {
    return null;
  }
}