const fs = require('fs');
const inquirer = require('inquirer');
const BouyomiChan = require('bouyomi-chan');
const { driver } = require('@rocket.chat/sdk');
const yaml = require('js-yaml')

let settings = yaml.load(fs.readFileSync('settings.yml'));

const bouyomiChan = new BouyomiChan({ port: settings.bouyomichan.port });

const main = async () => {
    await driver.connect({ host: settings.rocketchat.host })
    settings.rocketchat.password = (await inquirer.prompt([
        {
            type: 'password',
            message: 'パスワードを入力してください：',
            name: 'password',
        }
    ])).password;
    await driver.login({ username: settings.rocketchat.user, password: settings.rocketchat.password });
    await driver.joinRooms(settings.rocketchat.rooms);
    await driver.subscribeToMessages();
    await driver.reactToMessages((err, message) => {
        if (!err) {
            bouyomiChan.speak(message.msg);
        }
    });
}

main();
