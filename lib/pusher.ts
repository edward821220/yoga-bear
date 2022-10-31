import Pusher from "pusher";

const pusher = new Pusher({
  /* eslint-disable  @typescript-eslint/no-non-null-assertion */
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
  /* eslint-enable  @typescript-eslint/no-non-null-assertion */
});

export default pusher;
