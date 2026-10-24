
import * as signalR from "@microsoft/signalr";

const chatConnection = new signalR.HubConnectionBuilder()
  .withUrl("http://localhost:5250/chatHub", {
    accessTokenFactory: () =>
      localStorage.getItem("token"),
  })
  .withAutomaticReconnect()
  .configureLogging(signalR.LogLevel.Information)
  .build();

export default chatConnection;
