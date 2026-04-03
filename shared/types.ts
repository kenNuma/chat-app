export type User = {
    id: number;
    name: string;
};

export type ChatRequest = {
    text: string;
};

export type Room = {
    id: number;
    name: string;
};

export type MessageUser = {
    id: number;
    name: string;
};

export type Message = {
    id: number;
    content: string;
    userId: number;
    roomId: number;
    createdAt: Date;
    user?: MessageUser;
}