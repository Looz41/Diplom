const User = require('../models/User/user')

class UserService {

    async activate(activationLink: string) {
        const user = await User.findOne({ activationLink });
        if (!user) {
            throw new Error('Неккоректная ссылка авторизации')
        }
        user.isActivated = true;
        delete user.activationLink;
        await user.save()
    }


    async restore(restoreLink: string) {
        const user = await User.findOne({ restoreLink });

        if (!user) {
            throw new Error('Неккоректная ссылка восстановления')
        }

        user.password = user.newPassword;
        delete user.newPassword;
        delete user.restoreLink;

        await user.save()
    }
}

module.exports = new UserService()