const { Client, Intents } = require('discord.js');
const Config = require('./config.json'); 
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

client.on('ready', () => {
  console.log(`계정 '${client.user.tag}'으로 로그인 성공!`);
});

const setting = {
    cmd: [
        '/생성',
        '/참여',
        '/삭제',
        '/두기', 
        '/빙고',
        '/포기'
    ],
    gameStart: false,
    roomCreate: false,
    turn: 1, 
    player: [],
    block: [
        '⬜',
        '🔴',
        '🔵'
    ],
    number: '1⃣2⃣3⃣4⃣5⃣6⃣7⃣',
    map: [
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0]
    ]
};

client.on('messageCreate', function(message) {
    if (message.author.bot) return;

    const sender = message.member.toString();
    const command = message.content.split(' ');

    switch (command[0]) {
        case setting.cmd[0]:
            if (!setting.roomCreate) {
                setting.player.push(sender);
                setting.roomCreate = true;
                message.reply('방을 생성했습니다.');
            } else {
                message.reply('방이 이미 존재합니다.');
            }
            break;
        case setting.cmd[1]:
            if (setting.roomCreate) {
                if (setting.player[1] == null) {
                    if (setting.player[0] != sender) {
                        setting.player.push(sender);
                        setting.gameStart = true;
                        message.reply('게임에 참여했습니다.\n\n' + setting.player[0] + ' [빨]\nvs\n' + setting.player[1] + ' [파]');
                    } else {
                        message.reply('중복 참여입니다.');
                    }
                } else {
                    message.reply('방 인원이 꽉 찼습니다.');
                }
            } else {
                message.reply('참여 가능한 방이 없습니다.');
            }
            break;
        case setting.cmd[2]:
            if (setting.roomCreate) {
                if (!setting.gameStart) {
                    resetGame();
                    message.reply('방을 삭제했습니다.');
                } else {
                    message.reply('게임이 진행중입니다.');
                }
            } else {
                message.reply('삭제 가능한 방이 없습니다.');
            }
            break;
        case setting.cmd[3]:
            if (setting.roomCreate) {
                if (setting.gameStart) {
                    if (getPlayerTurn() == sender) {
                        var check = checkAble(command[1]);
                        switch (check) {
                            case 4:
                                var insert = insertCoin(command[1] - 1);
                                if (insert) {
                                    if (checkDraw()) {
                                        message.reply(mapPrint());
                                        message.reply('무승부입니다. 게임을 종료합니다.');
                                        resetGame();
                                    } else {
                                        var result = mapPrint() + '\n\n다음턴: ';
                                        message.reply(result + getPlayerTurn());
                                    }
                                } else {
                                    message.reply('들어갈 수 없는 위치입니다.');
                                }
                                break;
                            case 3:
                                message.reply('1~7 사이의 자연수만 입력해주세요.');
                                break;
                            case 2:
                                message.reply('자연수만 입력해주세요.');
                                break;
                            case 1:
                                message.reply('숫자를 입력해주세요.');
                                break;
                        }
                    } else {
                        message.reply(getPlayerTurn() + '님의 차례입니다.');
                    }
                } else {
                    message.reply('참여 인원이 부족합니다.');
                }
            } else {
                message.reply('방을 먼저 생성하세요.');
            }
            break;
        case setting.cmd[4]:
            if (setting.roomCreate) {
                if (setting.gameStart) {
                    if (getPlayerTurn() == sender) {
                        var checkWin = winCheck();
                        if (checkWin) {
                            resetGame();
                            message.reply(sender + '님의 승리입니다.');
                        } else {
                            message.reply('지금은 빙고를 외칠 수 없습니다.');
                        }
                    } else {
                        message.reply(getPlayerTurn() + '님의 차례입니다.');
                    }
                } else {
                    message.reply('참여 인원이 부족합니다.');
                }
            } else {
                message.reply('방을 먼저 생성하세요.');
            }
            break;
        case setting.cmd[5]:
            if (setting.roomCreate) {
                if (setting.gameStart) {
                    if (getPlayerTurn() == sender) {
                        resetGame();
                        message.reply(sender + '님이 기권하셨습니다.');
                    } else {
                        message.reply(getPlayerTurn() + '님의 차례입니다.');
                    }
                } else {
                    message.reply('참여 인원이 부족합니다.');
                }
            } else {
                message.reply('방을 먼저 생성하세요.');
            }
            break;
    }

});

/*
 * 인자 y로 받은 위치에 동전을 넣을 수 있는지 확인 후 넣을 수 있으면 넣은 뒤, true 리턴
 */
function insertCoin(y) {
    if (setting.map[0][y] == 0) {
        if (setting.map[5][y] != 0) {
            for (x = 0; x < 6; x++) {
                if (setting.map[x][y] != 0) {
                    setting.map[x - 1][y] = setting.turn;
                    changeTurn();
                    break;
                }
            }
        } else {
            setting.map[5][y] = setting.turn; // 제일 밑 부분에 동전을 넣습니다.
            changeTurn();
        }
        return true;
    }
    return false;
}
 
/*
 * 숫자를 icon으로 변환하여 출력합니다.
 * 맵 출력시 사용됩니다.
 */
function mapBlock(num) {
    if (num != 0) {
        if (num == 1) {
            return setting.block[1];
        }
        return setting.block[2];
    }
    return setting.block[0];
}

/*
 * 입력 받은 숫자가 1~7 사이의 숫자인지 확인합니다.
 */
function checkAble(num) {
    if (num != null) {
        if (!isNaN(num)) {
            if (0 < num < 8) { return 4; }
            return 3;
        }
        return 2;
    }
    return 1;
}

/*
 * 현재 턴의 유저를 반환합니다. 
 */
function getPlayerTurn() {
    return setting.player[setting.turn - 1];
}
 
/*
 * 턴을 변경합니다.
 */
function changeTurn() {
    setting.turn = (setting.turn === 2) ? 1 : 2;
}
 
/*
 * 맵 상태를 출력합니다.
 */
function mapPrint() {
    var mapResult = [];
    for (x = 0; x < 6; x++) {
        var mapPreResult = [];
        for (y = 0; y < 7; y++) {
            switch (setting.map[x][y]) {
                case 0:
                    mapPreResult.push(mapBlock(0));
                    break;
                case 1:
                    mapPreResult.push(mapBlock(1));
                    break;
                case 2:
                    mapPreResult.push(mapBlock(2));
                    break;
            }
        }
        mapResult.push(mapPreResult.join(''));
    }
    return setting.number + '\n' + mapResult.join('\n');
}
 
/*
 * 맵과 기타 설정을 초기 상태로 리셋합니다.
 */
function resetGame() {
    setting.gameStart = false;
    setting.roomCreate = false;
    setting.turn = 1;
    setting.player = [];
    setting.map = [
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0]
    ];
}

/*
 * 4개가 연결된 숫자를 반환합니다.
 */
function winNumber() {
    return String(setting.turn).repeat(4);
}

/*
 * 가로 방향에 동전 4개가 이어져 있는지 확인합니다.
 */
function HorizontalCheck() {
    let result = [];
    let isWin = false;
    for (let i = 0; i < setting.map.length; i++)
        result.push(setting.map[i].join(''));

    result.forEach(element => {
        if (element.includes(winNumber()))
            isWin = true;
    });
    return isWin;
}
 
/*
 * 세로 방향에 동전 4개가 이어져 있는지 확인합니다.
 */
function VerticalCheck() {
    let dump = [[], [], [], [], [], [], []];
    let isWin = false;
    setting.map.forEach(element => {
        element.forEach((e, i) => {
            dump[i].push(e.toString());
        });
    });
    dump.forEach(element => {
        if (element.join('').includes(winNumber()))
            isWin = true;
    });
    return isWin;
}

/*
 * 대각선 방향에 동전 4개가 이어져 있는지 확인합니다.
 */
function DiagonalCheck() {
    let result = [[], []];
    let isWin = false;
    for (let i = 1 - setting.map.length; i < setting.map[0].length; i++) {
        let dump = [[], []];
        let y = Math.max(-i, 0);
        let x = Math.max(i, 0);
        while (x < setting.map[0].length && y < setting.map.length) {
            dump[0].push(setting.map[y][x]), dump[1].push(setting.map[y][6 - x]);
            y++, x++;
        }
        result[0].push(dump[0]), result[1].push(dump[1]);
    }

    result.forEach(element => { 
        element.forEach((e, i) => {
            if (e.join('').includes(winNumber()))
                isWin = true;
        });
    });
    return isWin;
}
 
/*
 * 가로, 세로, 대각선 방향 중 동전 4개기 한 곳이라도 이어져 있다면 true를 반환합니다.
 */
function winCheck() {
    if (HorizontalCheck() || VerticalCheck() || DiagonalCheck())
        return true;
    return false;
}
 
/*
 * 무승부인지 확인합니다.
 */
function checkDraw() {
    for (y = 0; y < setting.map[0].length; y++) {
        if (setting.map[0][y] === 0)
            return false;
    }
    if (winCheck())
        return false;
    return true;
}

process.on('warning', (warning) => {
    console.log(warning.stack);
});

client.login(Config.BOT_TOKEN);
