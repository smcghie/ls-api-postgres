interface UserResponse {
    id: string;
    username: string;
    name: string;
    avatar: string;
    friends: { id: string }[];
    albumCount: number;
}
