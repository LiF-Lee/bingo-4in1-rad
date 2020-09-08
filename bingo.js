const setting = { //게임 세팅
   cmd: {
      "0": "/생성",
      "1": "/참여",
      "2": "/삭제",
      "3": "/두기",
      "4": "/빙고",
      "5": "/포기"
   }, //Made By EliF
   gameStart: false,
   roomCreate: false,
   turn: 1,
   player: [],
   block: {
      "0": "⬜",
      "1": "🔴",
      "2": "🔵"
   },
   number: "1⃣2⃣3⃣4⃣5⃣6⃣7⃣",
   map: [
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0]
   ]
};
function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
   var command = msg.split(" ");
   switch (command[0]) {
      case setting.cmd["0"]:
         if (!setting.roomCreate) {
            setting.player.push(sender);
            setting.roomCreate = true;
            replier.reply("방을 생성했습니다.");
         } else {
            replier.reply("방이 이미 존재합니다.");
         }
         break;
      case setting.cmd["1"]:
         if (setting.roomCreate) {
            if (setting.player[1] == null) {
               if (setting.player[0] != sender) {
                  setting.player.push(sender);
                  setting.gameStart = true;
                  replier.reply("게임에 참여했습니다.\n\n" + setting.player[0] + " [빨]\nvs\n" + setting.player[1] + " [파]");
               } else {
                  replier.reply("중복 참여입니다.");
               }
            } else {
               replier.reply("방 인원이 꽉 찼습니다.");
            }
         } else {
            replier.reply("참여 가능한 방이 없습니다.");
         }
         break;
      case setting.cmd["2"]:
         if (setting.roomCreate) {
            if (!setting.gameStart) {
               resetGame();
               replier.reply("방을 삭제했습니다.");
            } else {
               replier.reply("게임이 진행중입니다.");
            }
         } else {
            replier.reply("삭제 가능한 방이 없습니다.");
         }
         break;
      case setting.cmd["3"]:
         if (setting.roomCreate) {
            if (setting.gameStart) {
               if (getPlayerTurn() == sender) {
                  var check = checkAble(command[1]);
                  switch (check) {
                     case 4:
                        var insert = insertCoin(command[1] - 1);
                        if (insert) {
                           var result = mapPrint() + "\n\n다음턴: ";
                           replier.reply(result + getPlayerTurn());
                        } else {
                           replier.reply("들어갈 수 없는 위치입니다.");
                        }
                        break;
                     case 3:
                        replier.reply("1~7 사이의 자연수만 입력해주세요.");
                        break;
                     case 2:
                        replier.reply("자연수만 입력해주세요.");
                        break;
                     case 1:
                        replier.reply("숫자를 입력해주세요.");
                        break;
                  }
               } else {
                  replier.reply(getPlayerTurn() + "님의 차례입니다.");
               }
            } else {
               replier.reply("참여 인원이 부족합니다.");
            }
         } else {
            replier.reply("방을 먼저 생성하세요.");
         }
         break;
      case setting.cmd["4"]:
         if (setting.roomCreate) {
            if (setting.gameStart) {
               if (getPlayerTurn() == sender) {
                  var checkWin = winCheck();
                  if (checkWin) {
                     resetGame();
                     replier.reply(sender + "님의 승리입니다.");
                  } else {
                     replier.reply("지금은 빙고를 외칠 수 없습니다.");
                  }
               } else {
                  replier.reply(getPlayerTurn() + "님의 차례입니다.");
               }
            } else {
               replier.reply("참여 인원이 부족합니다.");
            }
         } else {
            replier.reply("방을 먼저 생성하세요.");
         }
         break;
      case setting.cmd["5"]:
         if (setting.roomCreate) {
            if (setting.gameStart) {
               if (getPlayerTurn() == sender) {
                  resetGame();
                  replier.reply(sender + "님이 기권하셨습니다.");
               } else {
                  replier.reply(getPlayerTurn() + "님의 차례입니다.");
               }
            } else {
               replier.reply("참여 인원이 부족합니다.");
            }
         } else {
            replier.reply("방을 먼저 생성하세요.");
         }
         break;
   }
}
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
         setting.map[5][y] = setting.turn;
         changeTurn();
      }
      return true;
   } else {
      return false;
   }
}
function mapBlock(num) {
   if (num != 0) {
      if (num == 1) {
         return setting.block["1"];
      } else {
         return setting.block["2"];
      }
   } else {
      return setting.block["0"];
   }
}
function checkAble(num) {
   if (num != null) {
      if (!isNaN(num)) {
         if (0 < num < 8) {
            return 4;
         } else {
            return 3;
         }
      } else {
         return 2;
      }
   } else {
      return 1;
   }
}
function getPlayerTurn() {
   return setting.player[setting.turn - 1];
}
function changeTurn() {
   setting.turn == 1 ? setting.turn = 2 : setting.turn = 1;
}
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
      mapResult.push(mapPreResult.join(""));
   }
   return setting.number + "\n" + mapResult.join("\n");
}
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
   ]
}
function winNumber() {
   var number = String(setting.turn);
   return number.repeat(4);
}
function VerticalCheckL() {
   let out = [];
   for (let i = 1 - setting.map.length; i < setting.map[0].length; i++) {
      let o = [];
      let y = Math.max(-i, 0);
      let x = Math.max(i, 0);
      while (x < setting.map[0].length && y < setting.map.length)
         o.push(setting.map[y++][x++]);
      out.push(o.join(""))
   }
   for (line = 0; line < 12; line++) {
      if (out[line].indexOf(winNumber()) != -1) {
         return true;
      }
   }
   return false;
}
function mapVertical() {
   var mapV = [];
   for (x = 0; x < 6; x++) {
      var mapU = [];
      for (y = 0; y < 7; y++) {
         mapU.push(setting.map[x][y]);
      }
      mapV.push(mapU.reverse());
   }
   return JSON.stringify(mapV);
}
function VerticalCheckR() {
   let mapV = JSON.parse(mapVertical());
   let out = [];
   for (let i = 1 - mapV.length; i < mapV[0].length; i++) {
      let o = [];
      let y = Math.max(-i, 0);
      let x = Math.max(i, 0);
      while (x < mapV[0].length && y < mapV.length)
         o.push(mapV[y++][x++]);
      out.push(o.join(""))
   }
   for (line = 0; line < 12; line++) {
      if (out[line].indexOf(winNumber()) != -1) {
         return true;
      }
   }
   return false;
}
function GaroCheck() {
   var checkGaro = [];
   for (x = 0; x < 6; x++) {
      var checkNumber = [];
      for (y = 0; y < 7; y++) {
         checkNumber.push(setting.map[x][y]);
      }
      checkGaro.push(checkNumber.join(""));
   }
   for (line = 0; line < 6; line++) {
      if (checkGaro[line].indexOf(winNumber()) != -1) {
         return true;
      }
   }
   return false;
}
function SeroCheck() {
   var checkSero = [];
   for (y = 0; y < 7; y++) {
      var checkNumber = [];
      for (x = 0; x < 6; x++) {
         checkNumber.push(setting.map[x][y]);
      }
      checkSero.push(checkNumber.join(""));
   }
   for (line = 0; line < 7; line++) {
      if (checkSero[line].indexOf(winNumber()) != -1) {
         return true;
      }
   }
   return false;
}
function winCheck() {
   if (GaroCheck()) {
      return true;
   } else if (SeroCheck()) {
      return true;
   } else if (VerticalCheckR()) {
      return true;
   } else if (VerticalCheckL()) {
      return true;
   }
   return false;
}
