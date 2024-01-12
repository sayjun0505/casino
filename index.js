const express = require('express');
const app = express();
const WebSocket = require('ws');
const axios = require('axios');
const wss = new WebSocket.Server({ port: 7071 });

var rooms = {
    'blackjack': []
};
var wsIds = [];

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

app.get("/test", (req, res) => {
    res.send({status: 'success'});
})
function getRandomInt(min, max, avoidIndexArray) {
    min = Math.ceil(min);
    max = Math.floor(max);
    let returnValue = Math.floor(Math.random() * (max - min)) + min;
    avoidIndexArray.map((index) => {
        if (index === returnValue)
            returnValue = getRandomInt(min, max, avoidIndexArray);
    });
    return returnValue;
}

function sendBroadCast(type) {
    wss.clients.forEach(function each(client) {
        client.send(JSON.stringify({
            type: type, 
            instruction: 'show_room',
            rooms: rooms[type],
            id: client.id,
        }))
    })
}
function sendData(wsId, data) {
    wss.clients.forEach(function each(client) {
        if (client.id === wsId) {
            client.send(JSON.stringify(data));
            return;
        }
    })
}
function blackjack(ws, receivedData) {
    let room;
    let playerCardIndexes1 = [], playerCardIndexes2 = [], dealerCardIndexes = [];
    switch(receivedData.instruction) {
        case 'fetch_room':
            sendBroadCast('blackjack');
            break;
        case 'create_room':
            rooms['blackjack'].push({
                id: ws.id,
                name: receivedData.name,
                connectedPlayers: [{id: ws.id, playerType: 'Dealer'}]
            });
            sendData(ws.id, {
                type: 'blackjack',
                instruction: 'create_room',
                id: ws.id
            });
            sendBroadCast('blackjack');
            break;
        case 'join_room':
            room = rooms['blackjack'].find((room) => room.id === receivedData.roomId);
            room.connectedPlayers.push({id: ws.id, playerType: 'Player'});
            sendBroadCast('blackjack');
            setTimeout(() => {
                if (room.connectedPlayers.length === 2) {
                    room.connectedPlayers.map((player) => {
                        sendData(player.id, {
                            type: 'blackjack',
                            instruction: 'start_room',
                            roomId: room.id,
                            player: player,
                        })
                    })
                }
            }, 5000);
            break;
        case 'deal_ended':
            room = rooms['blackjack'].find((room) => room.id === receivedData.roomId);
            playerCardIndexes1.push(getRandomInt(0, 51, []));
            playerCardIndexes1.push(getRandomInt(0, 51, playerCardIndexes1));
            dealerCardIndexes.push(getRandomInt(0, 51, playerCardIndexes1));
            dealerCardIndexes.push(getRandomInt(0, 51, dealerCardIndexes.concat(playerCardIndexes1).concat(playerCardIndexes2)));

            room.connectedPlayers.map((player) => {
                sendData(player.id, {
                    type: 'blackjack',
                    instruction: 'deal_ended',
                    roomId: room.id,
                    dealedChipTypes: receivedData.dealedChipTypes,
                    dealedTotalAmount: receivedData.dealedTotalAmount,
                    playerCardIndexes1: playerCardIndexes1,
                    playerCardIndexes2: playerCardIndexes2,
                    dealerCardIndexes: dealerCardIndexes,
                })
            })
            break;
        case 'hit':
            room = rooms['blackjack'].find((room) => room.id === receivedData.roomId);
            dealerCardIndexes = receivedData.dealerCardIndexes;
            playerCardIndexes1 = receivedData.playerCardIndexes1;
            playerCardIndexes2 = receivedData.playerCardIndexes2;
            room.connectedPlayers.map((player) => {
                if (player.id === receivedData.playerId) {
                    console.log(player.playerType);
                    if (player.playerType === "Dealer") dealerCardIndexes.push(getRandomInt(0, 51, dealerCardIndexes.concat(playerCardIndexes1).concat(playerCardIndexes2)));
                    else if (player.playerType === "Player") {
                        if (receivedData.playerCardsIndex === 1) playerCardIndexes1.push(getRandomInt(0, 51, dealerCardIndexes.concat(playerCardIndexes1).concat(playerCardIndexes2)));
                        else if (receivedData.playerCardsIndex === 2) playerCardIndexes2.push(getRandomInt(0, 51, dealerCardIndexes.concat(playerCardIndexes1).concat(playerCardIndexes2)));
                    }
                }
            });
            room.connectedPlayers.map((player) => {
                sendData(player.id, {
                    type: 'blackjack',
                    instruction: 'hit',
                    roomId: room.id,
                    player: player,
                    playerCardIndexes1: playerCardIndexes1,
                    playerCardIndexes2: playerCardIndexes2,
                    dealerCardIndexes: dealerCardIndexes,
                })
            })
            break;
        case 'stand':
            room = rooms['blackjack'].find((room) => room.id === receivedData.roomId);
            dealerCardIndexes = receivedData.dealerCardIndexes;
            playerCardIndexes1 = receivedData.playerCardIndexes1;
            playerCardIndexes2 = receivedData.playerCardIndexes2;
            room.connectedPlayers.map((player) => {
                sendData(player.id, {
                    type: 'blackjack',
                    instruction: 'stand',
                    roomId: room.id,
                    player: player,
                    playerCardIndexes1: playerCardIndexes1,
                    playerCardIndexes2: playerCardIndexes2,
                    dealerCardIndexes: dealerCardIndexes,
                    playerCardsIndex: receivedData.playerCardsIndex
                })
            })
            break;
        case 'insure':
            room = rooms['blackjack'].find((room) => room.id === receivedData.roomId);
            dealerCardIndexes = receivedData.dealerCardIndexes;
            playerCardIndexes1 = receivedData.playerCardIndexes1;
            playerCardIndexes2 = receivedData.playerCardIndexes2;
            room.connectedPlayers.map((player) => {
                sendData(player.id, {
                    type: 'blackjack',
                    instruction: 'insure',
                    roomId: room.id, 
                    player: player,
                    playerCardIndexes1: playerCardIndexes1,
                    playerCardIndexes2: playerCardIndexes2,
                    dealerCardIndexes: dealerCardIndexes,
                })
            })
            break;
        case 'split':
            room = rooms['blackjack'].find((room) => room.id === receivedData.roomId);
            dealerCardIndexes = receivedData.dealerCardIndexes;
            playerCardIndexes1 = receivedData.playerCardIndexes1;
            playerCardIndexes2 = receivedData.playerCardIndexes2;
            playerCardIndexes2.push(playerCardIndexes1[1]);
            playerCardIndexes1.pop();
            room.connectedPlayers.map((player) => {
                sendData(player.id, {
                    type: 'blackjack',
                    instruction: 'split',
                    roomId: room.id,
                    player: player,
                    playerCardIndexes1: playerCardIndexes1,
                    playerCardIndexes2: playerCardIndexes2,
                    dealerCardIndexes: dealerCardIndexes,
                })
            })

    }
}

function start() {

    wss.on('connection', (ws) => {
        console.log('connected');
        ws.id = uuidv4();
        wsIds.push(ws.id);
        sendBroadCast('blackjack');

        ws.on('message', (messageAsString) => {
            // const message = JSON.parse(messageAsString);
            let receivedData = JSON.parse(messageAsString);
            switch (receivedData.type) {
                case 'blackjack':
                    blackjack(ws, receivedData);
                    break;
            }
            // wss.clients.forEach(function each(client) {
            //     // client.send(msg);
            //     console.log(client.id)
            // });
            // wss.clients.foreach((client) => {
            //     console.log(client)
            // })
            // const metaData = clients.get(ws);

            // message.sender = metaData.id;
            // message.color = metaData.color;

            // const outbound = JSON.stringify(message);
            // [...clients.keys()].forEach((client) => {
            //     client.send(outbound);
            // })
        })

        ws.on('close', () => {
            console.log("close");
            let roomIndex = rooms['blackjack'].findIndex((room) => room.id === ws.id);
            let wsIdIndex = wsIds.findIndex((id) => id === ws.id);
            rooms['blackjack'].splice(roomIndex, 1);
            wsIds.splice(wsIdIndex, 1);
            ws.close();
            sendBroadCast('blackjack');
        })
    })
}

app.listen(4000, () => {
    console.log('running on port 4000');
    start();
})