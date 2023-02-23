import { createContext } from 'react';
import Head from "next/head";
import RoomList from '@/components/WebRTC/RoomList';
import styles from '../components/PageElements/styles.module.css'
const MyContext = createContext("")

export default function Ready() {

    return (
    <>
      <Head>
      <title>Ready</title>
      </Head>
      <div className={styles.readyBox}>
        <RoomList />
      </div>
    </>
    )
}