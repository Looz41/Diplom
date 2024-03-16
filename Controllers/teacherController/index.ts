const Teachers = require('../../models/Teachers')

const { validationResult } = require('express-validator')

class teachersController {
    /**
     * Функция добавления новой дисциплины
     * @param req - запрос
     * @param res - ответ
     * @returns res
     */

    async getTeachersByGroup(req, res) {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.status(400).json({ error: 'Ошибка ввода' })
            }
            const { groupName } = req.body;
            if (!groupName) {
                return res.status(400).json({ message: 'Название группы не может быть пустым' })
            }
            const { disciplineName } = req.body;
            if (!disciplineName) {
                return res.status(400).json({ message: 'Название дисциплины не может быть пустым' })
            }
            const group = await Teachers.find({ disciplines: disciplineName })
            if (group === null) {
                return res.status(411).json({ error: 'Группы с данным названием не существует' })
            }
            res.json({ disciplines: group.disciplines })
        } catch (e) {
            console.log(e)
        }
    }
}

export { teachersController };
