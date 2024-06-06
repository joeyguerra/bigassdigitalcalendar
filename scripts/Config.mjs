// Description:
//   Configure the bot.
//
// Author:
//   Joey Guerra

export default async robot => {
    if (!robot.config) {
        robot.config = {}
    }
    robot.config = Object.assign(robot.config, process.env)
    robot.config.TIME_ZONE = 'CST'
    robot.config.LANG = 'en-US'
    robot.logger.info('Mapped environment to config.')
}