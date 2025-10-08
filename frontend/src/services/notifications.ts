// import { db } from "@/lib/firebase"
// import { collection, addDoc, query, where, orderBy, onSnapshot, updateDoc, doc, getDocs, writeBatch } from "firebase/firestore"
import { Notification, NotificationType, getNotificationMessage, getNotificationTitle } from "@/lib/notifications"

export const createNotification = async (
  userId: string,
  type: NotificationType,
  data: {
    staffName?: string
    date?: Date
    locationName?: string
    shiftType?: string
    locationId?: string
    requestId?: string
  }
) => {
  try {
    const notification: Omit<Notification, "id"> = {
      type,
      title: getNotificationTitle(type),
      message: getNotificationMessage(type, data),
      userId,
      read: false,
      createdAt: new Date(),
      data: {
        date: data.date,
        locationId: data.locationId,
        shiftType: data.shiftType,
        requestId: data.requestId
      }
    }

    await addDoc(collection(db, "notifications"), notification)
  } catch (error) {
    console.error("Error creating notification:", error)
  }
}

export const subscribeToUserNotifications = (
  userId: string,
  callback: (notifications: Notification[]) => void
) => {
  const q = query(
    collection(db, "notifications"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  )

  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Notification[]
    callback(notifications)
  })
}

export const markNotificationAsRead = async (notificationId: string) => {
  try {
    await updateDoc(doc(db, "notifications", notificationId), {
      read: true
    })
  } catch (error) {
    console.error("Error marking notification as read:", error)
  }
}

export const markAllNotificationsAsRead = async (userId: string) => {
  try {
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      where("read", "==", false)
    )
    
    const snapshot = await getDocs(q)
    const batch = writeBatch(db)
    
    snapshot.docs.forEach((docSnapshot) => {
      batch.update(docSnapshot.ref, { read: true })
    })
    
    await batch.commit()
  } catch (error) {
    console.error("Error marking all notifications as read:", error)
  }
}
