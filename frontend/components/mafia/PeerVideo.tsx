import { useEffect, useRef } from "react";

interface PeerVideoProps {
  stream: MediaStream;
  muted?: boolean;
  className?: string;
}

//NOTE - MediaStream을 재생하는 video 엘리먼트 (원격은 오디오 포함, 로컬은 muted로 하울링 방지)
const PeerVideo = ({ stream, muted = false, className }: PeerVideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && videoRef.current.srcObject !== stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return <video ref={videoRef} autoPlay playsInline muted={muted} className={className} />;
};

export default PeerVideo;
