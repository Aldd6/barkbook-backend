class UpdateUserDTO {
    constructor(body) {
        if(body.rolId !== undefined) this.rolId = body.rolId;
        if(body.username !== undefined) this.username = body.username.trim();
        if(body.email !== undefined) this.email = body.email.toLowerCase().trim();
        if(body.password !== undefined) this.password = body.password.trim();
        if(body.profileCompleted !== undefined) this.profileCompleted = Boolean(body.profileCompleted);
    }
}
module.exports = UpdateUserDTO;