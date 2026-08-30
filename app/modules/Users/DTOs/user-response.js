class UserResponseDTO {
    constructor(body) {
        this.uid = body.uid;
        this.rolId = body.rolId;
        this.username = body.username;
        this.email = body.email;
        this.profileCompleted = body.profileCompleted;
    }

    static fromList(users) {
        return users.map(user => new UserResponseDTO(user));
    }
}
module.exports = UserResponseDTO;