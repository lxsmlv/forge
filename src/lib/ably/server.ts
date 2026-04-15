import Ably from 'ably';

let restClient: Ably.Rest | null = null;

function getRestClient(): Ably.Rest {
  if (!restClient) {
    const key = process.env.ABLY_ROOT_KEY;
    if (!key) throw new Error('ABLY_ROOT_KEY missing from env');
    restClient = new Ably.Rest(key);
  }
  return restClient;
}

export async function publishToUser(
  userId: string,
  event: string,
  data: unknown,
): Promise<void> {
  try {
    const client = getRestClient();
    const channel = client.channels.get(`user:${userId}`);
    await channel.publish(event, data);
  } catch (err) {
    console.error('Ably publish failed', err);
  }
}
