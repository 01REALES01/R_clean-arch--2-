export class Category {
    constructor(
        public readonly id: string,
        public name: string,
        public color: string,
        public icon: string,
        public userId: string,
        public readonly createdAt: Date,
        public updatedAt: Date,
    ) { }

    static create(props: {
        id?: string;
        name: string;
        color: string;
        icon: string;
        userId: string;
        createdAt?: Date;
        updatedAt?: Date;
    }): Category {
        const now = new Date();
        return new Category(
            props.id || '',
            props.name,
            props.color,
            props.icon,
            props.userId,
            props.createdAt || now,
            props.updatedAt || now,
        );
    }
}
