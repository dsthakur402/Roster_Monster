// import { auth, db } from "@/lib/firebase"
// import { createUserWithEmailAndPassword } from "firebase/auth"
// import { doc, setDoc } from "firebase/firestore"
import { Staff } from "@/lib/roster"
import { createNotification } from "./notifications"

export const sendStaffInvite = async (email: string, staff: Staff, isEditor: boolean = false) => {
  try {
    // Create temporary password
    const tempPassword = Math.random().toString(36).slice(-8)
    
    // // Create Firebase auth user
    // const userCredential = await createUserWithEmailAndPassword(auth, email, tempPassword)
    
    // // Create user document
    // await setDoc(doc(db, "users", userCredential.user.uid), {
    //   email,
    //   staffId: staff.id,
    //   role: isEditor ? "editor" : "user",
    //   department: staff.department,
    //   canEditRoster: isEditor,
    //   createdAt: new Date()
    // })

    // // Link staff record to user
    // await setDoc(doc(db, "staff", staff.id), {
    //   ...staff,
    //   userId: userCredential.user.uid,
    //   email,
    //   isEditor
    // })

    // Create notification for new account
    await createNotification(userCredential.user.uid, "ROSTER_CHANGE", {
      staffName: staff.name,
      date: new Date()
    })

    // In a real app, you would send an email here with the temporary password
    console.log(`Temporary password for ${email}: ${tempPassword}`)

    return userCredential.user
  } catch (error) {
    console.error("Error creating staff account:", error)
    throw error
  }
}
