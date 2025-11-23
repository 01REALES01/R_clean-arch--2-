export class Subtask {
    constructor(
        public readonly id: string,
        public title: string,
        public completed: boolean,
        public taskId: string,
        public readonly createdAt: Date,
        public updatedAt: Date,
    ) { }

    static create(props: {
        id?: string;
        title: string;
        completed?: boolean;
        taskId: string;
        createdAt?: Date;
        updatedAt?: Date;
    }): Subtask {
        const now = new Date();
        return new Subtask(
            props.id || '',
            props.title,
            props.completed || false,
            props.taskId,
            props.createdAt || now,
            props.updatedAt || now,
        );
    }
}
