import Head from "next/head";
import React, { ReactNode, useState, useEffect, useRef } from 'react'
import { useSpring, animated, to } from '@react-spring/web'
import { useDrag, useGesture } from 'react-use-gesture'
import styles from "./styles.module.css";
import { useRouter } from "next/router";
import CloneVideo from "../Game/CloneVideo";
import dynamic from "next/dynamic";

const PuzzleSegment = dynamic(
    import('@/components/Game/CloneVideo'), {
    loading: () => (<div></div>),
    ssr: false
    },
);

const backgroundImageUrl = '/images/transparentPuzzle.png'

const calcX = (y: number, ly: number) => -(y - ly - window.innerHeight / 2) / 20
const calcY = (x: number, lx: number) => (x - lx - window.innerWidth / 2) / 20

const auth = true;
const id = 4;

interface MyConstraints {
    audio?: boolean | MediaTrackConstraints;
    video?: boolean | MediaTrackConstraints;
}


export default function PuzzleScreen() {

    const router = useRouter();
    const userVideoRef = useRef<any>();
    const userStreamRef = useRef<MediaStream>();

    async function getCameras(): Promise<void> {
        try  {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const cameras = devices.filter((device) => device.kind === "videoinput");
            if (typeof userStreamRef.current !== "undefined") {
                const currentCamera = userStreamRef.current.getVideoTracks()[0];
            }
        } catch (e) {
            console.log(e);
        }
    }

    async function getMedia(deviceId?: string): Promise<void> {
        const initialConstraints: MyConstraints = {
          audio: false,
          // video: { facingMode: "user" },
          video: { width: 640, height: 480 },
        };
        const cameraConstraints: MyConstraints = {
          audio: false,
          video: { deviceId: { exact: deviceId } },
        };
    
        try {
          const stream = await navigator.mediaDevices.getUserMedia(deviceId ? cameraConstraints : initialConstraints);
          userStreamRef.current = stream;
          userVideoRef.current.srcObject = stream;
          userVideoRef.current.onloadedmetadata = () => {
            userVideoRef.current.play();
          };
          if (!deviceId) {
            console.log("[get Cameras]");
            await getCameras();
          }
        } catch (e) {
          console.log(e);
        }
    }

    const handleRoomCreated = async (): Promise<void> => {
        try {
          console.log("[Homepage joined]");
          await getMedia();
        } catch (e) {
          console.log(e);
        }
      };

    useEffect(() => {
        const preventDefault = (e: Event) => e.preventDefault()
        document.addEventListener('gesturestart', preventDefault)
        document.addEventListener('gesturechange', preventDefault)
        // const startButtonPosition = document.getElementById("startButton")?.getBoundingClientRect();
        // setTargetX(startButtonPosition?.x);
        // setTargetY(startButtonPosition?.y);
        handleRoomCreated();
    
        return () => {
          document.removeEventListener('gesturestart', preventDefault)
          document.removeEventListener('gesturechange', preventDefault)
        }
      }, [])

    const domTarget = useRef(null);
    const [{ x, y,rotateX, rotateY, rotateZ, zoom, scale }, api] = useSpring(
        () => ({
            rotateX: 0,
            rotateY: 0,
            rotateZ: 0,
            scale: 1,
            zoom: 0,
            x: 0,
            //TODO: 시작위치는 왼쪽으로 조정이 되는데, 처음 잡았을때 다시 0/0으로 돌아간 다음에 시작함. 수정하자.
            y: 0,
            config: { mass: 5, tension: 350, friction: 50 },
        })
        )
    
    
        const bind = useDrag(
            (params) => {
                if(!params.down) {
                    console.log(x.get(), y.get());
                }
                if(!params.down && isPuzzleMatched(x.get(), y.get())) {
                    router.push({
                        pathname: '/ready',
                    })
                }
            }
        );

    useGesture(
        {
            onDrag: ({active, offset: [x,y]}) =>
                api.start({ x, y, rotateX: 0, rotateY: 0, scale: active ? 1 : 1.1 }),
            onPinch: ({ offset: [d, a] }) => api({ zoom: d / 200, rotateZ: a }),
            onMove: ({ xy: [px, py], dragging }) =>
                !dragging &&
                api({
                rotateX: calcX(py, y.get()),
                rotateY: calcY(px, x.get()),
                scale: 1.1,
                }),
            onHover: ({ hovering }) =>
                !hovering && api({ rotateX: 0, rotateY: 0, scale: 1 }),
        },
        { domTarget, eventOptions: { passive: false } }
    )


    return (
        <>
            <video className="w-full hidden" id="myface" autoPlay playsInline ref={userVideoRef}></video>
            <div className="flex flex-row place-items-center">
                <div className={styles.container}>
                    <animated.div
                    ref={domTarget}
                    className={styles.card}
                    {...bind()}
                    style={{
                        transform: 'perspective(600px)',
                        x,
                        y,
                        scale: to([scale, zoom], (s, z) => s + z),
                        rotateX,
                        rotateY,
                        rotateZ,
                    }}>
                    <animated.div>
                        <PuzzleSegment auth={auth} id={id} videoId="myface" segmentState="" />
                    </animated.div>
                    </animated.div>
                </div>
            </div>
        </>
    )
}


export function isPuzzleMatched(x: number, y: number) {
    const diff = 60;
    if( x > 375 - diff && x < 375 + diff && y > -65 - diff && y < -65 + diff ) {
        return true;
    } else return false;
}