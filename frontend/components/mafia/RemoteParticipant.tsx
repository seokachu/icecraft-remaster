import S from "@/style/livekit/livekit.module.css";
import RemoteParticipantTile from "@/components/mafia/RemoteParticipantTile";
import { useMediaRoom } from "@/components/mafia/MediaRoom";

const RemoteParticipant = () => {
  const { remotePeers } = useMediaRoom();

  return (
    <ul className={S.remoteParticipant}>
      {remotePeers.map((peer) => (
        <RemoteParticipantTile key={peer.userId} peer={peer} />
      ))}
    </ul>
  );
};

export default RemoteParticipant;
