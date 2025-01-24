import { Client, type GroupChat, type Message, type GroupParticipant } from 'whatsapp-web.js';

import Config from './config.js';

class Commander {
    client: Client;
    msg: Message;
    config: Config;

    constructor(client: Client, msg: Message) {
        this.client = client;
        this.msg = msg;
        this.config = Config.getInstance();
    }

    public async senderParticipant(): Promise<GroupParticipant | undefined> {
        const participants = await this.participants();
        const senderId = await this.senderId();
        return participants.find((participant) => participant.id._serialized === senderId);
    }

    public async participants(): Promise<GroupParticipant[]> {
        const chat = await this.msg.getChat();
        if (!chat.isGroup) {
            return [];
        }
        return (chat as GroupChat).participants;
    }

    public async participantIds(): Promise<string[]> {
        const chat = await this.msg.getChat();
        if (!chat.isGroup) {
            return [];
        }
        return (chat as GroupChat).participants.map((participant) => participant.id._serialized);
    }

    public async isMe(): Promise<boolean> {
        return this.msg.fromMe;
    }

    public async botIsAdmin(): Promise<boolean> {
        const participants = await this.participants();
        const myId = await this.myId();
        const botParticipant = participants.find((participant) => participant.id._serialized === myId);
        return botParticipant?.isAdmin || botParticipant?.isSuperAdmin || false;
    }

    public async senderId(): Promise<string> {
        return this.msg.author || this.msg.from;
    }

    public async authorIsOwner(): Promise<boolean> {
        return (await this.senderId()) == this.config.owner;
    }

    public async authorIsAdmin(): Promise<boolean> {
        const participant = await this.senderParticipant();
        return participant?.isAdmin || participant?.isSuperAdmin || false;
    }

    public async authorIsUser(): Promise<boolean> {
        return !this.authorIsAdmin();
    }

    public async isGroup(): Promise<boolean> {
        return (await this.msg.getChat()).isGroup;
    }

    public async myId(): Promise<string> {
        return this.client.info.wid._serialized;
    }

    public async groupChat(): Promise<GroupChat> {
        return this.msg.getChat() as Promise<GroupChat>;
    }
}

export default Commander;
