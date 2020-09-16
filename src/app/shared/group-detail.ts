export class GroupDetail {
    groupId: number;
    groupName: string;
    //groupParticipants: string;
    groupParticipants: [{
        userId: number;
        userName: string;

    }]
    userId: number;
}
