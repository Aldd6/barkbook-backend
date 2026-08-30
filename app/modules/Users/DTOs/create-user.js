class CreateUserDTO {
    constructor(body) {
        this.rolId = body.rolId;
        this.username = body.username?.trim();
        this.email = body.email?.toLowerCase().trim();
        this.password = body.password?.trim();
    }
}
module.exports = CreateUserDTO;