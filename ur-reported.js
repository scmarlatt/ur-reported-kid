const Discord = require('discord.js');
const auth = require('./auth.json');
const client = new Discord.Client();

const REPORTS_BEFORE_UR_MUTED = 3;
const TIMEOUT_DURATION = 10000;

const userBehavior = {};

const updateBehavior = (id, reset = false) => {
  console.log('updating behavior');
  if (!userBehavior[id]) {
    console.log('initializing behavior to 1');
    userBehavior[id] = {
      numReports: 1,
    };
  } else {
    if (reset) {
      userBehavior[id].numReports = 0;
    } else {
      console.log('incrementing');
      userBehavior[id].numReports += 1;
    }
  }
};

const checkBehavior = (id) => {
  console.log('checking behavior');
  if (userBehavior[id] && userBehavior[id].numReports >= REPORTS_BEFORE_UR_MUTED) {
    return false;
  }
  return true;
};

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', (message) => {
  try {
    if (message && message.content && typeof message.content === 'string' && message.content[0] === '!') {
      if (!message.guild) {
        return;
      }
      if (message.content.startsWith('!report')) {
        const reportedUser = message.mentions.users.first();
        console.log(reportedUser.username);
        if (reportedUser) {
          const member = message.guild.member(reportedUser);
          if (member) {
            console.log(reportedUser.id);
            updateBehavior(reportedUser.id);
            const goodboye = checkBehavior(reportedUser.id);
            if (!goodboye) {
              member.setMute(true, 'Reported too many times, kid');
              setTimeout(() => {
                console.log(`unmuting user: ${reportedUser.id}`);
                member.setMute(false);
                updateBehavior(reportedUser.id, true);
              }, TIMEOUT_DURATION);
              message.reply(`@${reportedUser.username} ur reported, kid. heres a ${TIMEOUT_DURATION / 1000} second timeout`);
            } else {
              message.reply(`${reportedUser.username} has ${userBehavior[reportedUser.id].numReports} reports, max ${REPORTS_BEFORE_UR_MUTED} allowed`);
            }
          } else {
            message.reply('That user isn\'t in this server, chief!');
          }
        } else {
          message.reply('No user specified to report, chief!');
        }
      }
    }
  } catch (err) {
    console.error(err);
  }
});

client.login(auth.token);
