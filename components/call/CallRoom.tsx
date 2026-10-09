"use client";

import {
  Mic,
  MicOff,
  PhoneOff,
  Video,
  VideoOff,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { connectSignaling, type SignalPayload } from "@/lib/call/signaling";

const ICE_SERVERS: RTCIceServer[] = [{ urls: "stun:stun.l.google.com:19302" }];

type CallStatus = "connecting" | "waiting" | "connected" | "ended" | "error";

export function CallRoom({
  chatId,
  userId,
  mode,
  closeHref,
}: {
  chatId: string;
  userId: string;
  mode: "audio" | "video";
  closeHref: string;
}) {
  const t = useTranslations("call");
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const signalingRef = useRef<ReturnType<typeof connectSignaling> | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const [status, setStatus] = useState<CallStatus>("connecting");
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(mode === "video");

  useEffect(() => {
    let cancelled = false;

    async function start() {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: mode === "video",
        });
      } catch {
        if (!cancelled) setStatus("error");
        return;
      }
      if (cancelled) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      setStatus("waiting");

      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
      pcRef.current = pc;
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      pc.ontrack = (event) => {
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
        setStatus("connected");
      };
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          signalingRef.current?.sendSignal({ candidate: event.candidate.toJSON() });
        }
      };

      async function makeOffer() {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        signalingRef.current?.sendSignal({ sdp: offer });
      }

      const signaling = connectSignaling(chatId, userId, {
        // Only the peer that joins *second* initiates the offer, so both
        // sides don't race to create one (classic WebRTC "glare").
        onJoined: (peers) => {
          if (peers.length > 0) {
            setStatus("connecting");
            makeOffer();
          }
        },
        onPeerJoined: () => setStatus("connecting"),
        onPeerLeft: () => setStatus("waiting"),
        onSignal: async (data: SignalPayload) => {
          if ("sdp" in data) {
            await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
            if (data.sdp.type === "offer") {
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              signalingRef.current?.sendSignal({ sdp: answer });
            }
          } else if ("candidate" in data) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
            } catch {
              // ICE candidates can arrive before the remote description is set; safe to ignore.
            }
          }
        },
      });
      signalingRef.current = signaling;
    }

    start();

    return () => {
      cancelled = true;
      pcRef.current?.close();
      signalingRef.current?.close();
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [chatId, userId, mode]);

  function toggleMic() {
    localStreamRef.current?.getAudioTracks().forEach((track) => (track.enabled = !micOn));
    setMicOn((value) => !value);
  }

  function toggleCam() {
    localStreamRef.current?.getVideoTracks().forEach((track) => (track.enabled = !camOn));
    setCamOn((value) => !value);
  }

  function hangUp() {
    pcRef.current?.close();
    signalingRef.current?.close();
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    setStatus("ended");
  }

  const statusLabel =
    status === "connecting"
      ? t("connecting")
      : status === "waiting"
        ? t("waiting")
        : status === "connected"
          ? t("connected")
          : status === "error"
            ? t("permissionDenied")
            : t("ended");

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <div className="relative flex-1">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="h-full w-full bg-neutral-900 object-cover"
        />
        {mode === "video" && (
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="absolute right-4 bottom-28 h-32 w-24 rounded-lg border border-white/20 object-cover"
          />
        )}
        <p className="absolute top-4 left-4 rounded-full bg-black/50 px-3 py-1 text-sm">
          {statusLabel}
        </p>
      </div>
      <div className="flex items-center justify-center gap-4 bg-black/80 p-6">
        <button
          type="button"
          onClick={toggleMic}
          className="rounded-full bg-white/10 p-4 hover:bg-white/20"
        >
          {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
        </button>
        {mode === "video" && (
          <button
            type="button"
            onClick={toggleCam}
            className="rounded-full bg-white/10 p-4 hover:bg-white/20"
          >
            {camOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </button>
        )}
        {status === "ended" ? (
          <a
            href={closeHref}
            className="rounded-full bg-white/10 px-6 py-4 text-sm font-medium hover:bg-white/20"
          >
            {t("close")}
          </a>
        ) : (
          <button
            type="button"
            onClick={hangUp}
            className="rounded-full bg-danger p-4 hover:opacity-90"
          >
            <PhoneOff className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}
