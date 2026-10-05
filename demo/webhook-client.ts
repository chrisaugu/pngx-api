import bodyParser from 'body-parser';
import express from 'express';
import crypto from 'node:crypto';

const app = express();
const PORT = 3001;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

const SECRET = "secret";
const dytePublicKey = "";

app.post('/webhook', (req, res) => {
    const payload = req.body;
    const { event, data } = payload;

    console.log('📩 Webhook received:', payload);

    const unique_id = req.headers["x-xxx-webhook-id"] as string;
    // const signature = req.headers['x-webhook-signature'] as string;
    const signature = req.headers['x-signature'] as string;

    const isVerified = verifySignature(
        SECRET,
        JSON.stringify(payload),
        signature
    );

    if (!isVerified) {
        res.status(401).send('Invalid Signature');
        return;
    }

    switch (event) {
        case 'user.created':
            console.log(`New user created: ${data.id}`);
            // Add your logic here to handle the new user creation

            fetch('https://ntfy.sh/server_down_alerts', {
                method: 'POST',
                body: JSON.stringify(data)
            });

            break;

        case 'payment.cancelled':
            console.log(`Payment Webhook:`, unique_id);

            break;

        case 'order.cancelled':
            console.log(`Order Webhook:`, unique_id);

            break;

        case 'meeting.participantJoined':
            // let { meeting, participant } = data;
            // Then define and call a method to handle the joined participant
            // handleParticipantJoined(meeting, participant);
            break;
        case 'recording.statusUpdate':
            // let { meeting, recording } = data;
            // Then define and call a method to handle the recording status update
            // handleRecordingUpdate(meeting, recording);
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    // Always reply with 200 OK so the sender knows you got it
    res.status(200).send('Webhook received');
});

// const processWebhook = async (req, handler) => {
//     // Extract the unique ID, using Shopify for this example
//     const unique_id = req.headers["X-xxx-Webhook-Id"];
//     // Create a new entry for that webhook id
//     await client
//         .query("INSERT INTO processed_webhooks (id) VALUES $1", [unique_id])
//         .catch((e) => {
//             // PostgreSQL code for unique violation
//             if (e.code == "23505") {
//                 // We are already processing or processed this webhook, return silently
//                 return true;
//             }
//             throw e;
//         });
//     try {
//         // Call you method
//         await handler(req.body);
//         return true;
//     } catch {
//         // Delete the entry on error to make sure the next one isn't ignored
//         await client.query("DELETE FROM processed_webhooks WHERE id = $1", [
//             unique_id,
//         ]);
//     }
// };

// app.post("/webhooks/order-created", (req, res) => {
//     // Wrap your doSomething method to handle your webhook
//     return processWebhook(req, doSomething).catch(() => res.sendStatus(500));
// });


function verifySignature(secret: string, payload: string, signature: string) {
    if (!secret || !payload || !signature) return false;

    const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');

    return crypto.timingSafeEqual(
        Buffer.from(expectedSignature),
        Buffer.from(signature)
    );
}

function verifyWebhookSignature(rawBody: string, signatureHeader: string, secret: string) {
    const expected = crypto
        .createHmac('sha256', secret)
        .update(Buffer.from(rawBody))
        .digest('base64');

    return crypto.timingSafeEqual(
        Buffer.from(signatureHeader, 'base64'),
        Buffer.from(expected, 'base64')
    );
}