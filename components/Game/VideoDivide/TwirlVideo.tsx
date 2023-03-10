import { useCallback, useEffect, useMemo, useRef } from "react";

// import { getHostFace } from "./FaceLandMarkMy";
// import { getGuestFace } from "./FaceLandMarkPeer";
interface segmentData {
    auth: boolean;
}
export default function TwirlVideo({ auth }: segmentData) {
    const videoId = auth ? 'peerface_twirl' : 'myface_twirl';
    const cloneRef = useRef<HTMLCanvasElement>(null);
    const requestID = useRef<number>(0);
    let ctx: CanvasRenderingContext2D | null = null;
    useEffect(() => {
        if (!cloneRef.current) return;

        ctx = cloneRef.current.getContext('2d', { alpha: false, willReadFrequently: true });

        return () => {
            cancelAnimationFrame(requestID.current);
        };
    }, [cloneRef]);
    // const xyr = useRef([160, 120, 50]); 
    const video = document.getElementById(videoId) as HTMLCanvasElement; // twirl된 것은 canvas에 그린거라 CanvasElement로 

    const draw = useCallback(() => {
        // let lr = Math.round(xyr.current[2] * 2.25);
        // let sr = Math.round(xyr.current[2] * 1.5);
        // ctx!.drawImage(video, xyr.current[0] - lr, xyr.current[1] - sr, 2 * lr, 2 * sr, 0, 0, 320, 240);
        ctx!.drawImage(video, 47, 45, 226, 150, 0, 0, 213, 160); // 주석처리한 것들을 종합하면 이렇게 됨
        requestID.current = requestAnimationFrame(draw);
    }, []);

    useEffect(() => {
        if (!video) return;
        if (!ctx) return;
        requestID.current = requestAnimationFrame(draw);
    }, [video]);


    return (
        <>
            <canvas id={`${auth ? 'my_twirl' : 'peer_twirl'}`} width="213" height="160" ref={cloneRef} ></canvas>
        </>
    );

}