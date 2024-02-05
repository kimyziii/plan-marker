import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyDRm3tuyEfqkUwQ5DmvdgzMaLpoweFgHek',
  authDomain: 'markers-3e004.firebaseapp.com',
  projectId: 'markers-3e004',
  storageBucket: 'markers-3e004.appspot.com',
  messagingSenderId: '733076584106',
  appId: '1:733076584106:web:fd0a27c3ae0bdb9eea42d3',
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)

export default app
