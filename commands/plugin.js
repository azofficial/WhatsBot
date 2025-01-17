
Skip to content
Pull requests
Issues
Marketplace
Explore
@azofficial
yusufusta /
WhatsAsena
Public

Code
Issues 8
Pull requests 7
Discussions
Actions
Projects
Wiki
Security

    Insights

WhatsAsena/plugins/_plugin.js /
@yusufusta
yusufusta WhatsAsena: Version 0.9.5
Latest commit f257569 on Dec 18, 2020
History
1 contributor
84 lines (73 sloc) 3.18 KB
/* Copyright (C) 2020 Yusuf Usta.
Licensed under the  GPL-3.0 License;
you may not use this file except in compliance with the License.
WhatsAsena - Yusuf Usta
*/

const Asena = require('../events');
const Config = require('../config');
const {MessageType} = require('@adiwajshing/baileys');
const got = require('got');
const fs = require('fs');
const Db = require('./sql/plugin');

const Language = require('../language');
const Lang = Language.getString('_plugin');

Asena.addCommand({pattern: 'install ?(.*)', fromMe: true, desc: Lang.INSTALL_DESC, usage: '.install https://gist.github.com/Quiec/cd5af0c153a613ba55c24f8c6b6f5565'}, (async (message, match) => {
    if (match[1] === '') return await message.sendMessage('```' + Lang.NEED_URL + '.install https://gist.github.com/Quiec/cd5af0c153a613ba55c24f8c6b6f5565```')
    try {
        var url = new URL(match[1]);
    } catch {
        return await message.sendMessage(Lang.INVALID_URL);
    }
    
    if (url.host === 'gist.github.com') {
        url.host = 'gist.githubusercontent.com';
        url = url.toString() + '/raw'
    } else {
        url = url.toString()
    }

    var response = await got(url);
    if (response.statusCode == 200) {
        // plugin adı
        var plugin_name = response.body.match(/addCommand\({.*pattern: ["'](.*)["'].*}/);
        if (plugin_name.length >= 1) {
            plugin_name = "__" + plugin_name[1];
        } else {
            plugin_name = "__" + Math.random().toString(36).substring(8);
        }

        fs.writeFileSync('./plugins/' + plugin_name + '.js', response.body);
        try {
            require('./' + plugin_name);
        } catch (e) {
            fs.unlinkSync('./' + plugin_name);
            return await message.sendMessage(Lang.INVALID_PLUGIN + ' ```' + e + '```');
        }

        await Db.installPlugin(url, plugin_name);
        await message.client.sendMessage(message.jid, Lang.INSTALLED, MessageType.text);
    }
}));

Asena.addCommand({pattern: 'plugin', fromMe: true, desc: Lang.PLUGIN_DESC}, (async (message, match) => {
    var mesaj = Lang.INSTALLED_FROM_REMOTE;
    var plugins = await Db.PluginDB.findAll();
    if (plugins.length < 1) {
        return await message.sendMessage(Lang.NO_PLUGIN);
    } else {
        plugins.map(
            (plugin) => {
                mesaj += '*' + plugin.dataValues.name + '*: ' + plugin.dataValues.url + '\n';
            }
        );
        return await message.client.sendMessage(message.jid, mesaj, MessageType.text);
    }
}));

Asena.addCommand({pattern: 'remove(?: |$)(.*)', fromMe: true, desc: Lang.REMOVE_DESC}, (async (message, match) => {
    if (match[1] === '') return await message.sendMessage(Lang.NEED_PLUGIN);
    if (!match[1].startsWith('__')) match[1] = '__' + match[1];
    var plugin = await Db.PluginDB.findAll({ where: {name: match[1]} });
    if (plugin.length < 1) {
        return await message.sendMessage(message.jid, Lang.NOT_FOUND_PLUGIN, MessageType.text);
    } else {
        await plugin[0].destroy();
        delete require.cache[require.resolve('./' + match[1] + '.js')]
        fs.unlinkSync('./plugins/' + match[1] + '.js');
        return await message.client.sendMessage(message.jid, Lang.DELETED, MessageType.text);
    }
}));
Footer
© 2022 GitHub, Inc.
Footer navigation

    Terms
    Privacy
    Security
    Status
    Docs
    Contact GitHub
    Pricing
    API
    Training
    Blog
    About

You have no unread notifications