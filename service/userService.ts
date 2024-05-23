const User = require('../models/User/user')

class UserService {

    async activate(activationLink: string) {
        const user = await User.findOne({ activationLink });
        if (!user) {
            throw new Error('Неккоректная ссылка авторизации')
        }
        user.isActivated = true;
        await user.save()
    }
}

module.exports = new UserService()