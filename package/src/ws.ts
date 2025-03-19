enum EMessageType {
    QUOTE = 'quote',
}

interface IEvent {
    id: number;
    callback: Function
}

type ISubscriber = {
    [x in EMessageType]: IEvent[];
};

let clients: ISubscriber = {};

export function subscribe(nodeId: string, topic: string) {
    clients[nodeId] = topic;
}

export function unsubscribe(nodeId: string, topic: string) {
    delete clients[topic][nodeId]
}

function publish(topic: string, message: string) {
    clients[topic].forEach(client => {
        console.log(client, message)
    });
}

class PubSub {
    events: ISubscriber;
    subscribtionId: number;

    constructor() {
        this.events = {};
        this.subscribtionId = 0;
    }

    // Subscribe to an event with a unique ID
    subscribe(event: string, callback: Function) {
        const id = ++this.subscribtionId;
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push({ id, callback });
        return id;
    }

    // Unsubscribe from an event
    // unsubscribe(event: string, callback: Function) {
    //     if (!this.events[event]) return;
    //     this.events[event] = this.events[event].filter(fn => fn !== callback);
    // }
    
    // Unsubscribe from an event by ID
    unsubscribe(event: string, id: number) {
        if (!this.events[event]) return;
        this.events[event] = this.events[event].filter(sub => sub.id !== id);
    }

    // Publish an event
    publish(event: string, data: string) {
        if (!this.events[event]) return;
        this.events[event].forEach(sub => sub.callback(data));
    }
}

// Usage
const pubSub = new PubSub();

// // Subscribe to 'message' event
// pubSub.subscribe('message', (data: string) => {
//     console.log(`Subscriber 1 received: ${data}`);
// });

// // Another subscription to 'message' event
// pubSub.subscribe('message', (data: string) => {
//     console.log(`Subscriber 2 received: ${data}`);
// });

// // Publish the 'message' event
// pubSub.publish('message', 'Hello, Pub/Sub!');


// Subscribe to 'message' event
let one = pubSub.subscribe('message', (data: string) => {
    console.log(`Subscriber 1 received: ${data}`);
});

// Another subscription to 'message' event
pubSub.subscribe('message', (data: string) => {
    console.log(`Subscriber 2 received: ${data}`);
});

// Publish the 'message' event
pubSub.publish('message', 'Hello, Pub/Sub!');

pubSub.unsubscribe('message', one);