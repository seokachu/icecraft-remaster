"use client";

import { Socket, io } from "socket.io-client";
import { ClientToServerEvents, ServerToClientEvents } from "@shared/socket-events";

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  process.env.NEXT_PUBLIC_SOCKET_SERVER_URL!,
  {
    autoConnect: false
  }
);
